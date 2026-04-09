import { useEffect, useMemo, useState } from "react";
import { Download, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge, Button, Card, Input, Modal, Pagination, Select, Table, Textarea } from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import { itemsMaestrosService, moduleService, permissionService, relacionesItemsMaestrosService, roleService, tablasMaestrasService } from "@/services";
import type { AppItemMaestro, AppModule, AppPermission, AppRelacionItemMaestro, AppRole, AppTablaMaestra } from "@/types";
import { formatDate } from "@/utils";

type MaintenanceTableKey = "masterTables" | "modules" | "roles" | "permissions";
type CatalogRow = AppModule | AppRole | AppTablaMaestra | AppPermission;

type CatalogFormState = {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  datosExtra: string;
};

type CatalogFormErrors = Partial<Record<keyof Omit<CatalogFormState, "id">, string>>;
type ItemFormState = {
  id?: number;
  codigo: string;
  nombre: string;
  orden: string;
  datosExtra: string;
};

type ItemFormErrors = Partial<Record<keyof Omit<ItemFormState, "id">, string>>;
type RelationFormState = {
  id?: number;
  itemHijoId: string;
  tipoRelacion: string;
  orden: string;
  datosExtra: string;
};

type RelationFormErrors = Partial<Record<keyof Omit<RelationFormState, "id">, string>>;

type TableMeta = {
  title: string;
  subtitle: string;
  badge: string;
  sourceLabel: string;
  searchPlaceholder: string;
  exportFilename: string;
  createLabel: string;
  editLabel: string;
  deleteLabel: string;
};

type FeedbackVariant = "info" | "error";

const INITIAL_FORM: CatalogFormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
  datosExtra: "",
};

const INITIAL_ITEM_FORM: ItemFormState = {
  codigo: "",
  nombre: "",
  orden: "",
  datosExtra: "",
};

const INITIAL_RELATION_FORM: RelationFormState = {
  itemHijoId: "",
  tipoRelacion: "",
  orden: "",
  datosExtra: "",
};

const TABLE_OPTIONS = [
  { label: "Tablas maestras", value: "masterTables" },
  { label: "Modulos", value: "modules" },
  { label: "Roles", value: "roles" },
  { label: "Permisos", value: "permissions" },
] as const;

const TABLE_META: Record<MaintenanceTableKey, TableMeta> = {
  masterTables: {
    title: "Tablas maestras",
    subtitle: "Catalogo base para referencias generales y relaciones maestras del sistema",
    badge: "ref.TablasMaestras",
    sourceLabel: "Tabla actual: ref.TablasMaestras",
    searchPlaceholder: "Ej. AREAS, CARGOS o CAMPANIAS",
    exportFilename: "tablas-maestras.csv",
    createLabel: "Crear tabla maestra",
    editLabel: "Editar tabla maestra",
    deleteLabel: "Eliminar tabla maestra",
  },
  modules: {
    title: "Modulos",
    subtitle: "Catalogo base para la navegacion, vistas y estructura funcional del sistema",
    badge: "seg.Modulos",
    sourceLabel: "Tabla actual: seg.Modulos",
    searchPlaceholder: "Ej. CONFIGURACION o USUARIOS",
    exportFilename: "modulos.csv",
    createLabel: "Crear modulo",
    editLabel: "Editar modulo",
    deleteLabel: "Eliminar modulo",
  },
  roles: {
    title: "Roles",
    subtitle: "Catalogo base de roles operativos y administrativos del sistema",
    badge: "seg.Roles",
    sourceLabel: "Tabla actual: seg.Roles",
    searchPlaceholder: "Ej. SUPER ADMIN o RRHH",
    exportFilename: "roles.csv",
    createLabel: "Crear rol",
    editLabel: "Editar rol",
    deleteLabel: "Eliminar rol",
  },
  permissions: {
    title: "Permisos",
    subtitle: "Catalogo de acciones y permisos disponibles para los modulos del sistema",
    badge: "seg.Permisos",
    sourceLabel: "Tabla actual: seg.Permisos",
    searchPlaceholder: "Ej. VER, CREAR, EXPORTAR o DESCARGAR",
    exportFilename: "permisos.csv",
    createLabel: "Crear permiso",
    editLabel: "Editar permiso",
    deleteLabel: "Eliminar permiso",
  },
};

function getStatusVariant(active: boolean): "success" | "danger" {
  return active ? "success" : "danger";
}

function getRowId(row: CatalogRow): number {
  if ("tablaMaestraId" in row) {
    return row.tablaMaestraId;
  }

  if ("permisoId" in row) {
    return row.permisoId;
  }

  return "rolId" in row ? row.rolId : row.moduloId;
}

function buildCsv(rows: CatalogRow[]): string {
  const escape = (value: string | number | boolean | null | undefined): string =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const lines = [
    ["Id", "Codigo", "Nombre", "Descripcion", "Activo"].join(","),
    ...rows.map((row) =>
      [
        escape(getRowId(row)),
        escape(row.codigo),
        escape(row.nombre),
        escape(row.descripcion),
        escape(row.activo ? "Activo" : "Inactivo"),
      ].join(","),
    ),
  ];

  return lines.join("\n");
}

function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getMetrics(rows: Array<{ activo: boolean }>) {
  return {
    total: rows.length,
    active: rows.filter((row) => row.activo).length,
    inactive: rows.filter((row) => !row.activo).length,
  };
}

export function MantenimientoTablasPage(): JSX.Element {
  const [activeTable, setActiveTable] = useState<MaintenanceTableKey>("modules");
  const [draftSearch, setDraftSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active">("active");
  const [masterTables, setMasterTables] = useState<AppTablaMaestra[]>([]);
  const [masterItems, setMasterItems] = useState<AppItemMaestro[]>([]);
  const [modules, setModules] = useState<AppModule[]>([]);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<AppPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);
  const [selectedCatalogRow, setSelectedCatalogRow] = useState<CatalogRow | null>(null);
  const [form, setForm] = useState<CatalogFormState>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<CatalogFormErrors>({});
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackVariant, setFeedbackVariant] = useState<FeedbackVariant>("info");
  const [selectedMasterTable, setSelectedMasterTable] = useState<AppTablaMaestra | null>(null);
  const [itemSearch, setItemSearch] = useState("");
  const [itemStatusFilter, setItemStatusFilter] = useState<"all" | "active">("active");
  const [itemsLoading, setItemsLoading] = useState(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isItemStatusOpen, setIsItemStatusOpen] = useState(false);
  const [isItemSaving, setIsItemSaving] = useState(false);
  const [isItemStatusSubmitting, setIsItemStatusSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AppItemMaestro | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormState>(INITIAL_ITEM_FORM);
  const [itemFormErrors, setItemFormErrors] = useState<ItemFormErrors>({});
  const [allItemsCatalog, setAllItemsCatalog] = useState<AppItemMaestro[]>([]);
  const [selectedParentItem, setSelectedParentItem] = useState<AppItemMaestro | null>(null);
  const [relationTypeFilter, setRelationTypeFilter] = useState("");
  const [relationStatusFilter, setRelationStatusFilter] = useState<"all" | "active">("active");
  const [relationsLoading, setRelationsLoading] = useState(false);
  const [relations, setRelations] = useState<AppRelacionItemMaestro[]>([]);
  const [isRelationFormOpen, setIsRelationFormOpen] = useState(false);
  const [isRelationStatusOpen, setIsRelationStatusOpen] = useState(false);
  const [isRelationSaving, setIsRelationSaving] = useState(false);
  const [isRelationStatusSubmitting, setIsRelationStatusSubmitting] = useState(false);
  const [selectedRelation, setSelectedRelation] = useState<AppRelacionItemMaestro | null>(null);
  const [relationForm, setRelationForm] = useState<RelationFormState>(INITIAL_RELATION_FORM);
  const [relationFormErrors, setRelationFormErrors] = useState<RelationFormErrors>({});

  const meta = TABLE_META[activeTable];
  const catalogRows: CatalogRow[] =
    activeTable === "masterTables"
      ? masterTables
      : activeTable === "modules"
        ? modules
        : activeTable === "roles"
          ? roles
          : permissions;
  const metrics = useMemo(() => getMetrics(catalogRows), [catalogRows]);
  const itemMetrics = useMemo(() => getMetrics(masterItems), [masterItems]);
  const relationMetrics = useMemo(() => getMetrics(relations), [relations]);

  const openFeedbackModal = (title: string, message: string, variant: FeedbackVariant): void => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackVariant(variant);
    setIsFeedbackOpen(true);
  };

  const filteredRows = useMemo(() => {
    return catalogRows;
  }, [catalogRows]);

  const paginatedRows = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const normalizedPage = Math.min(page, totalPages);
    const start = (normalizedPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const paginatedItems = useMemo(() => masterItems.slice(0, masterItems.length), [masterItems]);

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const normalizedPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== normalizedPage) {
      setPage(normalizedPage);
    }
  }, [normalizedPage, page]);

  const columns = useMemo<Array<TableColumn<CatalogRow>>>(
    () => [
      {
        key: "indice",
        header: "#",
        render: (row) => <span className="text-sm font-semibold text-slate-500">{getRowId(row)}</span>,
      },
      { key: "codigo", header: "Codigo", render: (row) => row.codigo },
      { key: "nombre", header: "Nombre", render: (row) => row.nombre },
      {
        key: "descripcion",
        header: "Descripcion",
        render: (row) => row.descripcion || "-",
      },
      {
        key: "estado",
        header: "Estado",
        render: (row) => <Badge variant={getStatusVariant(row.activo)}>{row.activo ? "Activo" : "Inactivo"}</Badge>,
      },
      {
        key: "fecha",
        header: "Creacion",
        render: (row) => formatDate(row.fechaCreacion || new Date().toISOString()),
      },
      {
        key: "acciones",
        header: "Acciones",
        render: (row) => (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              leftIcon={<Pencil size={14} />}
              onClick={() => {
                setSelectedCatalogRow(row);
                setForm({
                  id: getRowId(row),
                  codigo: row.codigo,
                  nombre: row.nombre,
                  descripcion: row.descripcion || "",
                  datosExtra: row.datosExtra || "",
                });
                setFormErrors({});
                setIsFormOpen(true);
              }}
              size="sm"
              variant="edit"
            >
              Editar
            </Button>
            <Button
              leftIcon={<Trash2 size={14} />}
              onClick={() => {
                setSelectedCatalogRow(row);
                setIsDeleteOpen(true);
              }}
              size="sm"
              variant={row.activo ? "delete" : "create"}
            >
              {row.activo ? "Inactivar" : "Reactivar"}
            </Button>
          </div>
        ),
      },
    ],
    [activeTable],
  );

  const loadCurrentTable = async (nextTable = activeTable, nextSearch = draftSearch, nextStatus = statusFilter): Promise<void> => {
    setLoading(true);

    try {
      if (nextTable === "masterTables") {
        const rows = await tablasMaestrasService.getAll(nextSearch, nextStatus === "active");
        setMasterTables(rows);
      } else if (nextTable === "modules") {
        const rows = await moduleService.getAll(nextSearch, nextStatus === "active");
        setModules(rows);
      } else if (nextTable === "roles") {
        const rows = await roleService.getAll(nextSearch, nextStatus === "active");
        setRoles(rows);
      } else {
        const rows = await permissionService.getAll(nextSearch, nextStatus === "active");
        setPermissions(rows);
      }
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "No se pudo cargar la tabla seleccionada.";
      openFeedbackModal("No se pudo continuar", message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setDraftSearch("");
    setStatusFilter("active");
    setSelectedCatalogRow(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setSelectedMasterTable(null);
    setMasterItems([]);
    setItemSearch("");
    setItemStatusFilter("active");
    setSelectedItem(null);
    setItemForm(INITIAL_ITEM_FORM);
    setItemFormErrors({});
    setAllItemsCatalog([]);
    setSelectedParentItem(null);
    setRelationTypeFilter("");
    setRelationStatusFilter("active");
    setRelations([]);
    setSelectedRelation(null);
    setRelationForm(INITIAL_RELATION_FORM);
    setRelationFormErrors({});
  }, [activeTable]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      void loadCurrentTable(activeTable, draftSearch.trim(), statusFilter);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeTable, draftSearch, statusFilter]);

  const loadItems = async (
    tablaMaestra = selectedMasterTable,
    searchValue = itemSearch,
    statusValue = itemStatusFilter,
  ): Promise<void> => {
    if (!tablaMaestra) {
      setMasterItems([]);
      return;
    }

    setItemsLoading(true);

    try {
      const rows = await itemsMaestrosService.getAll(tablaMaestra.tablaMaestraId, searchValue, statusValue === "active");
      setMasterItems(rows);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "No se pudieron cargar los items maestros.";
      openFeedbackModal("No se pudo continuar", message, "error");
    } finally {
      setItemsLoading(false);
    }
  };

  const loadAllItemsCatalog = async (): Promise<void> => {
    try {
      const rows = await itemsMaestrosService.getAll(undefined, undefined, false);
      setAllItemsCatalog(rows);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "No se pudo cargar el catalogo general de items.";
      openFeedbackModal("No se pudo continuar", message, "error");
    }
  };

  useEffect(() => {
    if (activeTable !== "masterTables") {
      return;
    }

    const nextSelection = selectedMasterTable
      ? masterTables.find((row) => row.tablaMaestraId === selectedMasterTable.tablaMaestraId) ?? null
      : masterTables[0] ?? null;

    if (nextSelection?.tablaMaestraId !== selectedMasterTable?.tablaMaestraId) {
      setSelectedMasterTable(nextSelection);
    }
  }, [activeTable, masterTables, selectedMasterTable]);

  useEffect(() => {
    if (activeTable !== "masterTables") {
      return;
    }

    void loadAllItemsCatalog();
  }, [activeTable]);

  useEffect(() => {
    if (activeTable !== "masterTables") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadItems(selectedMasterTable, itemSearch.trim(), itemStatusFilter);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeTable, selectedMasterTable, itemSearch, itemStatusFilter]);

  useEffect(() => {
    if (!selectedParentItem) {
      setRelations([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setRelationsLoading(true);

      try {
        const rows = await relacionesItemsMaestrosService.getAll(relationTypeFilter.trim() || undefined, selectedParentItem.itemMaestroId, relationStatusFilter === "active");
        setRelations(rows);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : "No se pudieron cargar las relaciones del item.";
        openFeedbackModal("No se pudo continuar", message, "error");
      } finally {
        setRelationsLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [selectedParentItem, relationTypeFilter, relationStatusFilter]);

  const validateForm = (): boolean => {
    const nextErrors: CatalogFormErrors = {};

    if (!form.codigo.trim()) {
      nextErrors.codigo = "El codigo es obligatorio.";
    }

    if (!form.nombre.trim()) {
      nextErrors.nombre = "El nombre es obligatorio.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      if (activeTable === "masterTables") {
        await tablasMaestrasService.save({
          tablaMaestraId: form.id,
          codigo: form.codigo.trim(),
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
          datosExtra: form.datosExtra.trim() || null,
        });
      } else if (activeTable === "modules") {
        await moduleService.save({
          moduloId: form.id,
          codigo: form.codigo.trim(),
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
          datosExtra: form.datosExtra.trim() || null,
        });
      } else if (activeTable === "roles") {
        await roleService.save({
          rolId: form.id,
          codigo: form.codigo.trim(),
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
          datosExtra: form.datosExtra.trim() || null,
        });
      } else {
        await permissionService.save({
          permisoId: form.id,
          codigo: form.codigo.trim(),
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
          datosExtra: form.datosExtra.trim() || null,
        });
      }

      const message = form.id ? `${meta.title.slice(0, -1)} actualizado correctamente.` : `${meta.title.slice(0, -1)} creado correctamente.`;
      openFeedbackModal("Proceso completado", message, "info");
      setIsFormOpen(false);
      setSelectedCatalogRow(null);
      setForm(INITIAL_FORM);
      setPage(1);
      await loadCurrentTable(activeTable, draftSearch.trim(), statusFilter);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : `No se pudo guardar ${meta.title.toLowerCase()}.`;
      openFeedbackModal("No se pudo guardar", message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeStatus = async (): Promise<void> => {
    if (!selectedCatalogRow) {
      return;
    }

    setIsStatusSubmitting(true);

    try {
      if (selectedCatalogRow.activo) {
        if (activeTable === "masterTables") {
          await tablasMaestrasService.remove((selectedCatalogRow as AppTablaMaestra).tablaMaestraId);
        } else if (activeTable === "modules") {
          await moduleService.remove((selectedCatalogRow as AppModule).moduloId);
        } else if (activeTable === "roles") {
          await roleService.remove((selectedCatalogRow as AppRole).rolId);
        } else {
          await permissionService.remove((selectedCatalogRow as AppPermission).permisoId);
        }

        const message = `${meta.title.slice(0, -1)} ${selectedCatalogRow.nombre} inactivado correctamente.`;
        openFeedbackModal("Proceso completado", message, "info");
      } else {
        if (activeTable === "masterTables") {
          await tablasMaestrasService.save({
            tablaMaestraId: (selectedCatalogRow as AppTablaMaestra).tablaMaestraId,
            codigo: selectedCatalogRow.codigo,
            nombre: selectedCatalogRow.nombre,
            descripcion: selectedCatalogRow.descripcion || null,
            datosExtra: selectedCatalogRow.datosExtra || null,
          });
        } else if (activeTable === "modules") {
          await moduleService.save({
            moduloId: (selectedCatalogRow as AppModule).moduloId,
            codigo: selectedCatalogRow.codigo,
            nombre: selectedCatalogRow.nombre,
            descripcion: selectedCatalogRow.descripcion || null,
            datosExtra: selectedCatalogRow.datosExtra || null,
          });
        } else if (activeTable === "roles") {
          await roleService.save({
            rolId: (selectedCatalogRow as AppRole).rolId,
            codigo: selectedCatalogRow.codigo,
            nombre: selectedCatalogRow.nombre,
            descripcion: selectedCatalogRow.descripcion || null,
            datosExtra: selectedCatalogRow.datosExtra || null,
          });
        } else {
          const permissionRow = selectedCatalogRow as AppPermission;
          await permissionService.save({
            permisoId: permissionRow.permisoId,
            codigo: permissionRow.codigo,
            nombre: permissionRow.nombre,
            descripcion: permissionRow.descripcion || null,
            datosExtra: permissionRow.datosExtra || null,
          });
        }

        const message = `${meta.title.slice(0, -1)} ${selectedCatalogRow.nombre} reactivado correctamente.`;
        openFeedbackModal("Proceso completado", message, "info");
      }

      setIsDeleteOpen(false);
      setSelectedCatalogRow(null);
      setPage(1);
      await loadCurrentTable(activeTable, draftSearch.trim(), statusFilter);
    } catch (statusError) {
      const message = statusError instanceof Error ? statusError.message : `No se pudo actualizar el estado de ${meta.title.toLowerCase()}.`;
      openFeedbackModal("No se pudo continuar", message, "error");
    } finally {
      setIsStatusSubmitting(false);
    }
  };

  const validateItemForm = (): boolean => {
    const nextErrors: ItemFormErrors = {};

    if (!itemForm.codigo.trim()) {
      nextErrors.codigo = "El codigo es obligatorio.";
    }

    if (!itemForm.nombre.trim()) {
      nextErrors.nombre = "El nombre es obligatorio.";
    }

    if (itemForm.orden.trim() && Number.isNaN(Number(itemForm.orden))) {
      nextErrors.orden = "El orden debe ser numerico.";
    }

    setItemFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveItem = async (): Promise<void> => {
    if (!selectedMasterTable || !validateItemForm()) {
      return;
    }

    setIsItemSaving(true);

    try {
      await itemsMaestrosService.save({
        itemMaestroId: itemForm.id,
        tablaMaestraId: selectedMasterTable.tablaMaestraId,
        codigo: itemForm.codigo.trim(),
        nombre: itemForm.nombre.trim(),
        orden: itemForm.orden.trim() ? Number(itemForm.orden) : null,
        datosExtra: itemForm.datosExtra.trim() || null,
      });

      openFeedbackModal("Proceso completado", itemForm.id ? "Item maestro actualizado correctamente." : "Item maestro creado correctamente.", "info");
      setIsItemFormOpen(false);
      setSelectedItem(null);
      setItemForm(INITIAL_ITEM_FORM);
      await loadItems(selectedMasterTable, itemSearch.trim(), itemStatusFilter);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "No se pudo guardar el item maestro.";
      openFeedbackModal("No se pudo guardar", message, "error");
    } finally {
      setIsItemSaving(false);
    }
  };

  const handleChangeItemStatus = async (): Promise<void> => {
    if (!selectedItem || !selectedMasterTable) {
      return;
    }

    setIsItemStatusSubmitting(true);

    try {
      if (selectedItem.activo) {
        await itemsMaestrosService.remove(selectedItem.itemMaestroId);
        openFeedbackModal("Proceso completado", `Item maestro ${selectedItem.nombre} inactivado correctamente.`, "info");
      } else {
        await itemsMaestrosService.save({
          itemMaestroId: selectedItem.itemMaestroId,
          tablaMaestraId: selectedItem.tablaMaestraId,
          codigo: selectedItem.codigo,
          nombre: selectedItem.nombre,
          orden: selectedItem.orden ?? null,
          datosExtra: selectedItem.datosExtra || null,
        });
        openFeedbackModal("Proceso completado", `Item maestro ${selectedItem.nombre} reactivado correctamente.`, "info");
      }

      setIsItemStatusOpen(false);
      setSelectedItem(null);
      await loadItems(selectedMasterTable, itemSearch.trim(), itemStatusFilter);
    } catch (statusError) {
      const message = statusError instanceof Error ? statusError.message : "No se pudo actualizar el estado del item maestro.";
      openFeedbackModal("No se pudo continuar", message, "error");
    } finally {
      setIsItemStatusSubmitting(false);
    }
  };

  const validateRelationForm = (): boolean => {
    const nextErrors: RelationFormErrors = {};

    if (!relationForm.itemHijoId) {
      nextErrors.itemHijoId = "Debe seleccionar un item hijo.";
    }

    if (!relationForm.tipoRelacion.trim()) {
      nextErrors.tipoRelacion = "El tipo de relacion es obligatorio.";
    }

    if (relationForm.orden.trim() && Number.isNaN(Number(relationForm.orden))) {
      nextErrors.orden = "El orden debe ser numerico.";
    }

    setRelationFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveRelation = async (): Promise<void> => {
    if (!selectedParentItem || !validateRelationForm()) {
      return;
    }

    setIsRelationSaving(true);

    try {
      await relacionesItemsMaestrosService.save({
        relacionId: relationForm.id,
        itemPadreId: selectedParentItem.itemMaestroId,
        itemHijoId: Number(relationForm.itemHijoId),
        tipoRelacion: relationForm.tipoRelacion.trim(),
        orden: relationForm.orden.trim() ? Number(relationForm.orden) : null,
        datosExtra: relationForm.datosExtra.trim() || null,
      });

      openFeedbackModal("Proceso completado", relationForm.id ? "Relacion actualizada correctamente." : "Relacion creada correctamente.", "info");
      setIsRelationFormOpen(false);
      setSelectedRelation(null);
      setRelationForm(INITIAL_RELATION_FORM);
      const rows = await relacionesItemsMaestrosService.getAll(relationTypeFilter.trim() || undefined, selectedParentItem.itemMaestroId, relationStatusFilter === "active");
      setRelations(rows);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "No se pudo guardar la relacion.";
      openFeedbackModal("No se pudo guardar", message, "error");
    } finally {
      setIsRelationSaving(false);
    }
  };

  const handleChangeRelationStatus = async (): Promise<void> => {
    if (!selectedRelation || !selectedParentItem) {
      return;
    }

    setIsRelationStatusSubmitting(true);

    try {
      if (selectedRelation.activo) {
        await relacionesItemsMaestrosService.remove(selectedRelation.relacionId);
        openFeedbackModal("Proceso completado", "Relacion inactivada correctamente.", "info");
      } else {
        await relacionesItemsMaestrosService.save({
          relacionId: selectedRelation.relacionId,
          itemPadreId: selectedRelation.itemPadreId,
          itemHijoId: selectedRelation.itemHijoId,
          tipoRelacion: selectedRelation.tipoRelacion,
          orden: selectedRelation.orden ?? null,
          datosExtra: selectedRelation.datosExtra || null,
        });
        openFeedbackModal("Proceso completado", "Relacion reactivada correctamente.", "info");
      }

      setIsRelationStatusOpen(false);
      setSelectedRelation(null);
      const rows = await relacionesItemsMaestrosService.getAll(relationTypeFilter.trim() || undefined, selectedParentItem.itemMaestroId, relationStatusFilter === "active");
      setRelations(rows);
    } catch (statusError) {
      const message = statusError instanceof Error ? statusError.message : "No se pudo actualizar el estado de la relacion.";
      openFeedbackModal("No se pudo continuar", message, "error");
    } finally {
      setIsRelationStatusSubmitting(false);
    }
  };

  const itemColumns = useMemo<Array<TableColumn<AppItemMaestro>>>(
    () => [
      {
        key: "indice",
        header: "#",
        render: (row) => <span className="text-sm font-semibold text-slate-500">{row.itemMaestroId}</span>,
      },
      { key: "codigo", header: "Codigo", render: (row) => row.codigo },
      { key: "nombre", header: "Nombre", render: (row) => row.nombre },
      { key: "orden", header: "Orden", render: (row) => row.orden ?? "-" },
      {
        key: "estado",
        header: "Estado",
        render: (row) => <Badge variant={getStatusVariant(row.activo)}>{row.activo ? "Activo" : "Inactivo"}</Badge>,
      },
      {
        key: "acciones",
        header: "Acciones",
        render: (row) => (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              leftIcon={<Pencil size={14} />}
              onClick={() => {
                setSelectedItem(row);
                setItemForm({
                  id: row.itemMaestroId,
                  codigo: row.codigo,
                  nombre: row.nombre,
                  orden: row.orden != null ? String(row.orden) : "",
                  datosExtra: row.datosExtra || "",
                });
                setItemFormErrors({});
                setIsItemFormOpen(true);
              }}
              size="sm"
              variant="edit"
            >
              Editar
            </Button>
            <Button
              leftIcon={<Trash2 size={14} />}
              onClick={() => {
                setSelectedItem(row);
                setIsItemStatusOpen(true);
              }}
              size="sm"
              variant={row.activo ? "delete" : "create"}
            >
              {row.activo ? "Inactivar" : "Reactivar"}
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const relationColumns = useMemo<Array<TableColumn<AppRelacionItemMaestro>>>(
    () => [
      {
        key: "indice",
        header: "#",
        render: (row) => <span className="text-sm font-semibold text-slate-500">{row.relacionId}</span>,
      },
      {
        key: "itemHijo",
        header: "Item hijo",
        render: (row) => {
          const childItem = allItemsCatalog.find((item) => item.itemMaestroId === row.itemHijoId);
          return (
            <div>
              <p className="font-medium text-slate-900">{childItem?.nombre || `Item ${row.itemHijoId}`}</p>
              <p className="text-xs text-slate-500">{childItem?.codigo || row.itemHijoId}</p>
            </div>
          );
        },
      },
      { key: "tipoRelacion", header: "Tipo relacion", render: (row) => row.tipoRelacion },
      { key: "orden", header: "Orden", render: (row) => row.orden ?? "-" },
      {
        key: "estado",
        header: "Estado",
        render: (row) => <Badge variant={getStatusVariant(row.activo)}>{row.activo ? "Activo" : "Inactivo"}</Badge>,
      },
      {
        key: "acciones",
        header: "Acciones",
        render: (row) => (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              leftIcon={<Pencil size={14} />}
              onClick={() => {
                setSelectedRelation(row);
                setRelationForm({
                  id: row.relacionId,
                  itemHijoId: String(row.itemHijoId),
                  tipoRelacion: row.tipoRelacion,
                  orden: row.orden != null ? String(row.orden) : "",
                  datosExtra: row.datosExtra || "",
                });
                setRelationFormErrors({});
                setIsRelationFormOpen(true);
              }}
              size="sm"
              variant="edit"
            >
              Editar
            </Button>
            <Button
              leftIcon={<Trash2 size={14} />}
              onClick={() => {
                setSelectedRelation(row);
                setIsRelationStatusOpen(true);
              }}
              size="sm"
              variant={row.activo ? "delete" : "create"}
            >
              {row.activo ? "Inactivar" : "Reactivar"}
            </Button>
          </div>
        ),
      },
    ],
    [allItemsCatalog],
  );

  const availableChildItems = useMemo(
    () => allItemsCatalog.filter((item) => item.itemMaestroId !== selectedParentItem?.itemMaestroId),
    [allItemsCatalog, selectedParentItem],
  );

  return (
    <div className="space-y-6">
      <Card bodyClassName="pt-5" className="border-[#dbe6f3] bg-[linear-gradient(180deg,#ffffff,#fbfdff)]" subtitle="Administre catalogos base del sistema desde una sola vista" title="Mantenimiento de tablas">
        <div className="grid gap-3 lg:grid-cols-[70px_220px_92px_minmax(0,1fr)_72px_220px_auto] lg:items-center">
          <div className="text-sm font-semibold text-slate-800">Tablas</div>
          <div>
            <Select
              containerClassName="space-y-0"
              hideLabel
              label="Tablas"
              onChange={(event) => setActiveTable(event.target.value as MaintenanceTableKey)}
              options={TABLE_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
              value={activeTable}
            />
          </div>
          <div className="text-sm font-semibold text-slate-800">Buscador</div>
          <div className="min-w-0">
            <Input
              containerClassName="space-y-0"
              hideLabel
              label="Buscador"
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder={meta.searchPlaceholder}
              value={draftSearch}
            />
          </div>
          <div className="text-sm font-semibold text-slate-800">Filtros</div>
          <div>
            <Select
              containerClassName="space-y-0"
              hideLabel
              label="Filtros"
              onChange={(event) => setStatusFilter(event.target.value as "all" | "active")}
              options={[
                { label: "Solo activos", value: "active" },
                { label: "Todos", value: "all" },
              ]}
              value={statusFilter}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <Button
              onClick={() => {
                setDraftSearch("");
                setStatusFilter("active");
                setPage(1);
                void loadCurrentTable(activeTable, "", "active");
              }}
              variant="clear"
            >
              Limpiar
            </Button>
          </div>
        </div>
      </Card>

      <Card bodyClassName="py-8" className="border-[#dbe6f3] bg-[linear-gradient(135deg,#f8fbff_0%,#eef5fd_55%,#e9f1fb_100%)] text-center">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/80 bg-white/80 px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Tabla activa</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{meta.title}</p>
            <p className="mt-1 text-sm text-slate-500">{meta.badge}</p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/80 px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Registros activos</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">{metrics.active}</p>
            <p className="mt-1 text-sm text-slate-500">Elementos vigentes para operacion</p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/80 px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Registros inactivos</p>
            <p className="mt-2 text-3xl font-semibold text-rose-600">{metrics.inactive}</p>
            <p className="mt-1 text-sm text-slate-500">Historial conservado sin borrar trazabilidad</p>
          </div>
        </div>
      </Card>

      <Card
        bodyClassName="pt-5"
        className="border-[#dbe6f3] bg-[linear-gradient(180deg,#ffffff,#fbfdff)]"
        subtitle={meta.subtitle}
        title={`Tablas de ${meta.title.toLowerCase()}`}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Listado principal</p>
              <p className="text-sm text-slate-500">
                {loading ? `Cargando ${meta.title.toLowerCase()}...` : `${total} registros encontrados${draftSearch.trim() ? ` para "${draftSearch.trim()}"` : ""}.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                leftIcon={<Plus size={16} />}
                onClick={() => {
                  setSelectedCatalogRow(null);
                  setForm(INITIAL_FORM);
                  setFormErrors({});
                  setIsFormOpen(true);
                }}
                variant="create"
              >
                Crear
              </Button>
              <Button leftIcon={<Download size={16} />} onClick={() => downloadCsv(meta.exportFilename, buildCsv(filteredRows))} variant="export">
                Exportar
              </Button>
            </div>
          </div>

          <Table columns={columns} emptyMessage={`No hay ${meta.title.toLowerCase()} para mostrar.`} getRowKey={(row) => String(getRowId(row))} rows={paginatedRows} />

          <Pagination
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
            page={normalizedPage}
            pageSize={pageSize}
            total={total}
          />
        </div>
      </Card>

      {activeTable === "masterTables" ? (
        <div className="space-y-6">
          <Card
            bodyClassName="pt-5"
            className="border-[#dbe6f3] bg-[linear-gradient(180deg,#ffffff,#fbfdff)]"
            subtitle="Siga la secuencia natural: primero tabla maestra, luego item y finalmente sus relaciones"
            title="Estructura de catalogos"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#dbe6f3] bg-[#f8fbff] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Paso 1</p>
                <p className="mt-2 text-base font-semibold text-slate-900">Tabla maestra</p>
                <p className="mt-1 text-sm text-slate-500">Define el contenedor principal del catalogo.</p>
              </div>
              <div className="rounded-2xl border border-[#dbe6f3] bg-[#f8fbff] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Paso 2</p>
                <p className="mt-2 text-base font-semibold text-slate-900">Items maestros</p>
                <p className="mt-1 text-sm text-slate-500">Agrupa y mantiene los elementos de esa tabla.</p>
              </div>
              <div className="rounded-2xl border border-[#dbe6f3] bg-[#f8fbff] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Paso 3</p>
                <p className="mt-2 text-base font-semibold text-slate-900">Relaciones</p>
                <p className="mt-1 text-sm text-slate-500">Conecta un item padre con sus items hijos y su tipo de vinculo.</p>
              </div>
            </div>
          </Card>

          <Card
            bodyClassName="pt-5"
            className="border-[#dbe6f3] bg-[linear-gradient(180deg,#ffffff,#fbfdff)]"
            subtitle={selectedMasterTable ? `Gestion detallada para ${selectedMasterTable.nombre}` : "Seleccione una tabla maestra activa para administrar sus items"}
            title="Items maestros"
          >
            <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_220px_auto] lg:items-center">
              <Select
                label="Tabla maestra"
                onChange={(event) => {
                  const nextTable = masterTables.find((row) => row.tablaMaestraId === Number(event.target.value)) ?? null;
                  setSelectedMasterTable(nextTable);
                }}
                options={(masterTables.length ? masterTables : []).map((row) => ({ label: row.nombre, value: String(row.tablaMaestraId) }))}
                value={selectedMasterTable ? String(selectedMasterTable.tablaMaestraId) : ""}
              />
              <Input label="Buscar item" onChange={(event) => setItemSearch(event.target.value)} placeholder="Ej. LIMA, ACTIVO, FULL_TIME" value={itemSearch} />
              <Select
                label="Filtro items"
                onChange={(event) => setItemStatusFilter(event.target.value as "all" | "active")}
                options={[
                  { label: "Solo activos", value: "active" },
                  { label: "Todos", value: "all" },
                ]}
                value={itemStatusFilter}
              />
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <Button
                  disabled={!selectedMasterTable}
                  leftIcon={<Plus size={16} />}
                  onClick={() => {
                    setSelectedItem(null);
                    setItemForm(INITIAL_ITEM_FORM);
                    setItemFormErrors({});
                    setIsItemFormOpen(true);
                  }}
                  variant="create"
                >
                  Crear item
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Tabla seleccionada</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{selectedMasterTable?.nombre || "-"}</p>
                <p className="mt-1 text-sm text-slate-500">{selectedMasterTable?.codigo || "Sin seleccion"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Items activos</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-600">{itemMetrics.active}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Items inactivos</p>
                <p className="mt-2 text-2xl font-semibold text-rose-600">{itemMetrics.inactive}</p>
              </div>
            </div>

              <Table
                columns={itemColumns}
                emptyMessage={selectedMasterTable ? "No hay items maestros para mostrar." : "Seleccione una tabla maestra para comenzar."}
                getRowKey={(row) => String(row.itemMaestroId)}
                rows={paginatedItems}
              />

              {itemsLoading ? <p className="text-sm text-slate-500">Cargando items maestros...</p> : null}
            </div>
          </Card>

          <Card
            bodyClassName="pt-5"
            className="border-[#dbe6f3] bg-[linear-gradient(180deg,#ffffff,#fbfdff)]"
            subtitle={selectedParentItem ? `Relaciones configuradas para ${selectedParentItem.nombre}` : "Seleccione un item padre para ver y administrar sus relaciones"}
            title="Relaciones items maestros"
          >
            <div className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_220px_auto] lg:items-center">
                <Select
                  label="Item padre"
                  onChange={(event) => {
                    const nextParent = masterItems.find((row) => row.itemMaestroId === Number(event.target.value)) ?? null;
                    setSelectedParentItem(nextParent);
                  }}
                  options={(masterItems.length ? masterItems : []).map((row) => ({ label: `${row.nombre} (${row.codigo})`, value: String(row.itemMaestroId) }))}
                  value={selectedParentItem ? String(selectedParentItem.itemMaestroId) : ""}
                />
                <Input
                  label="Tipo de relacion"
                  onChange={(event) => setRelationTypeFilter(event.target.value)}
                  placeholder="Ej. HIJO, DEPENDE_DE, CAMPANIA_PRODUCTO"
                  value={relationTypeFilter}
                />
                <Select
                  label="Filtro relaciones"
                  onChange={(event) => setRelationStatusFilter(event.target.value as "all" | "active")}
                  options={[
                    { label: "Solo activas", value: "active" },
                    { label: "Todas", value: "all" },
                  ]}
                  value={relationStatusFilter}
                />
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <Button
                    disabled={!selectedParentItem}
                    leftIcon={<Plus size={16} />}
                    onClick={() => {
                      setSelectedRelation(null);
                      setRelationForm(INITIAL_RELATION_FORM);
                      setRelationFormErrors({});
                      setIsRelationFormOpen(true);
                    }}
                    variant="create"
                  >
                    Crear relacion
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Item padre</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{selectedParentItem?.nombre || "-"}</p>
                  <p className="mt-1 text-sm text-slate-500">{selectedParentItem?.codigo || "Sin seleccion"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Relaciones activas</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-600">{relationMetrics.active}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Relaciones inactivas</p>
                  <p className="mt-2 text-2xl font-semibold text-rose-600">{relationMetrics.inactive}</p>
                </div>
              </div>

              <Table
                columns={relationColumns}
                emptyMessage={selectedParentItem ? "No hay relaciones para mostrar." : "Seleccione un item padre para comenzar."}
                getRowKey={(row) => String(row.relacionId)}
                rows={relations}
              />

              {relationsLoading ? <p className="text-sm text-slate-500">Cargando relaciones del item seleccionado...</p> : null}
            </div>
          </Card>
        </div>
      ) : null}

      <Modal
        footer={<Button loading={isSaving} onClick={() => void handleSave()} variant="create">{form.id ? "Guardar cambios" : meta.createLabel}</Button>}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCatalogRow(null);
          setForm(INITIAL_FORM);
          setFormErrors({});
        }}
        title={form.id ? meta.editLabel : meta.createLabel}
        variant="info"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            errorText={formErrors.codigo}
            label="Codigo"
            onChange={(event) => setForm((current) => ({ ...current, codigo: event.target.value.toUpperCase() }))}
            placeholder={
              activeTable === "modules"
                ? "Ej. CONFIGURACION.USUARIOS"
                : activeTable === "roles"
                  ? "Ej. SUPER_ADMIN"
                  : activeTable === "permissions"
                    ? "Ej. EXPORTAR"
                    : "Ej. AREAS"
            }
            value={form.codigo}
          />
          <Input
            errorText={formErrors.nombre}
            label="Nombre"
            onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
            placeholder={
              activeTable === "modules"
                ? "Ej. USUARIOS"
                : activeTable === "roles"
                  ? "Ej. SUPER ADMIN"
                  : activeTable === "permissions"
                    ? "Ej. Exportar"
                    : "Ej. Areas"
            }
            value={form.nombre}
          />
          <Textarea
            containerClassName="md:col-span-2"
            label="Descripcion"
            onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
            placeholder="Descripcion breve del registro"
            rows={3}
            value={form.descripcion}
          />
          <Textarea
            containerClassName="md:col-span-2"
            helperText="Opcional para metadata adicional del registro."
            label="Datos extra"
            onChange={(event) => setForm((current) => ({ ...current, datosExtra: event.target.value }))}
            placeholder='Ej. {"orden":1}'
            rows={3}
            value={form.datosExtra}
          />
        </div>
      </Modal>

      <Modal
        footer={<Button loading={isItemSaving} onClick={() => void handleSaveItem()} variant="create">{itemForm.id ? "Guardar cambios" : "Crear item maestro"}</Button>}
        isOpen={isItemFormOpen}
        onClose={() => {
          setIsItemFormOpen(false);
          setSelectedItem(null);
          setItemForm(INITIAL_ITEM_FORM);
          setItemFormErrors({});
        }}
        title={itemForm.id ? "Editar item maestro" : "Crear item maestro"}
        variant="info"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            errorText={itemFormErrors.codigo}
            label="Codigo"
            onChange={(event) => setItemForm((current) => ({ ...current, codigo: event.target.value.toUpperCase() }))}
            placeholder="Ej. CALLAO"
            value={itemForm.codigo}
          />
          <Input
            errorText={itemFormErrors.nombre}
            label="Nombre"
            onChange={(event) => setItemForm((current) => ({ ...current, nombre: event.target.value }))}
            placeholder="Ej. Callao"
            value={itemForm.nombre}
          />
          <Input
            errorText={itemFormErrors.orden}
            label="Orden"
            onChange={(event) => setItemForm((current) => ({ ...current, orden: event.target.value }))}
            placeholder="Ej. 1"
            value={itemForm.orden}
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Tabla maestra
            <p className="mt-1 font-semibold text-slate-900">{selectedMasterTable?.nombre || "-"}</p>
          </div>
          <Textarea
            containerClassName="md:col-span-2"
            helperText="Opcional para metadata adicional del item."
            label="Datos extra"
            onChange={(event) => setItemForm((current) => ({ ...current, datosExtra: event.target.value }))}
            placeholder='Ej. {"color":"azul"}'
            rows={3}
            value={itemForm.datosExtra}
          />
        </div>
      </Modal>

      <Modal
        footer={<Button loading={isRelationSaving} onClick={() => void handleSaveRelation()} variant="create">{relationForm.id ? "Guardar cambios" : "Crear relacion"}</Button>}
        isOpen={isRelationFormOpen}
        onClose={() => {
          setIsRelationFormOpen(false);
          setSelectedRelation(null);
          setRelationForm(INITIAL_RELATION_FORM);
          setRelationFormErrors({});
        }}
        title={relationForm.id ? "Editar relacion" : "Crear relacion"}
        variant="info"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Item padre
            <p className="mt-1 font-semibold text-slate-900">{selectedParentItem?.nombre || "-"}</p>
          </div>
          <Select
            errorText={relationFormErrors.itemHijoId}
            label="Item hijo"
            onChange={(event) => setRelationForm((current) => ({ ...current, itemHijoId: event.target.value }))}
            options={availableChildItems.map((item) => ({ label: `${item.nombre} (${item.codigo})`, value: String(item.itemMaestroId) }))}
            value={relationForm.itemHijoId}
          />
          <Input
            errorText={relationFormErrors.tipoRelacion}
            label="Tipo de relacion"
            onChange={(event) => setRelationForm((current) => ({ ...current, tipoRelacion: event.target.value.toUpperCase() }))}
            placeholder="Ej. HIJO"
            value={relationForm.tipoRelacion}
          />
          <Input
            errorText={relationFormErrors.orden}
            label="Orden"
            onChange={(event) => setRelationForm((current) => ({ ...current, orden: event.target.value }))}
            placeholder="Ej. 1"
            value={relationForm.orden}
          />
          <Textarea
            containerClassName="md:col-span-2"
            helperText="Opcional para metadata adicional de la relacion."
            label="Datos extra"
            onChange={(event) => setRelationForm((current) => ({ ...current, datosExtra: event.target.value }))}
            placeholder='Ej. {"prioridad":"alta"}'
            rows={3}
            value={relationForm.datosExtra}
          />
        </div>
      </Modal>

      <Modal
        footer={
          <Button loading={isStatusSubmitting} onClick={() => void handleChangeStatus()} variant={selectedCatalogRow?.activo ? "delete" : "create"}>
            {selectedCatalogRow?.activo ? "Confirmar inactivacion" : "Confirmar reactivacion"}
          </Button>
        }
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedCatalogRow(null);
        }}
        title={selectedCatalogRow?.activo ? `Inactivar ${meta.title.slice(0, -1).toLowerCase()}` : `Reactivar ${meta.title.slice(0, -1).toLowerCase()}`}
        variant="warning"
      >
        <p className="text-sm text-slate-600">
          {selectedCatalogRow
            ? selectedCatalogRow.activo
              ? activeTable === "modules"
                ? `Se inactivara el modulo ${selectedCatalogRow.nombre}. Esta accion ocultara su uso operativo, pero mantendra el historial.`
                : activeTable === "roles"
                  ? `Se inactivara el rol ${selectedCatalogRow.nombre}. Revise antes cualquier asignacion critica asociada.`
                  : `Se inactivara la tabla maestra ${selectedCatalogRow.nombre}. Esta accion ocultara su uso operativo, pero mantendra el historial.`
              : activeTable === "modules"
                ? `Se reactivara el modulo ${selectedCatalogRow.nombre} para volver a usarlo en el sistema.`
                : activeTable === "roles"
                  ? `Se reactivara el rol ${selectedCatalogRow.nombre} para que vuelva a estar disponible.`
                  : `Se reactivara la tabla maestra ${selectedCatalogRow.nombre} para volver a usarla en el sistema.`
            : "Seleccione un registro valido para continuar."}
        </p>
      </Modal>

      <Modal
        footer={
          <Button loading={isItemStatusSubmitting} onClick={() => void handleChangeItemStatus()} variant={selectedItem?.activo ? "delete" : "create"}>
            {selectedItem?.activo ? "Confirmar inactivacion" : "Confirmar reactivacion"}
          </Button>
        }
        isOpen={isItemStatusOpen}
        onClose={() => {
          setIsItemStatusOpen(false);
          setSelectedItem(null);
        }}
        title={selectedItem?.activo ? "Inactivar item maestro" : "Reactivar item maestro"}
        variant="warning"
      >
        <p className="text-sm text-slate-600">
          {selectedItem
            ? selectedItem.activo
              ? `Se inactivara el item maestro ${selectedItem.nombre}. Esta accion mantendra el historial pero ocultara su uso operativo.`
              : `Se reactivara el item maestro ${selectedItem.nombre} para volver a usarlo en el sistema.`
            : "Seleccione un item maestro valido para continuar."}
        </p>
      </Modal>

      <Modal
        footer={
          <Button loading={isRelationStatusSubmitting} onClick={() => void handleChangeRelationStatus()} variant={selectedRelation?.activo ? "delete" : "create"}>
            {selectedRelation?.activo ? "Confirmar inactivacion" : "Confirmar reactivacion"}
          </Button>
        }
        isOpen={isRelationStatusOpen}
        onClose={() => {
          setIsRelationStatusOpen(false);
          setSelectedRelation(null);
        }}
        title={selectedRelation?.activo ? "Inactivar relacion" : "Reactivar relacion"}
        variant="warning"
      >
        <p className="text-sm text-slate-600">
          {selectedRelation
            ? selectedRelation.activo
              ? "Se inactivara la relacion del item seleccionado. El historial se mantendra disponible."
              : "Se reactivara la relacion para volver a usarla en el sistema."
            : "Seleccione una relacion valida para continuar."}
        </p>
      </Modal>

      <Modal
        footer={
          <Button
            onClick={() => {
              setIsFeedbackOpen(false);
            }}
            variant="create"
          >
            Cerrar
          </Button>
        }
        isOpen={isFeedbackOpen}
        onClose={() => {
          setIsFeedbackOpen(false);
        }}
        title={feedbackTitle}
        variant={feedbackVariant}
      >
        <p>{feedbackMessage}</p>
      </Modal>
    </div>
  );
}

export default MantenimientoTablasPage;
