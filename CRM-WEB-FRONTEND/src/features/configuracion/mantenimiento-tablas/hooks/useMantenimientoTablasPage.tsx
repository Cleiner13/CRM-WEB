import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import { itemsMaestrosService, moduleService, permissionService, profileService, relacionesItemsMaestrosService, roleService, tablasMaestrasService } from "@/services";
import type { AppItemMaestro, AppModule, AppPermission, AppRelacionItemMaestro, AppRole, AppTablaMaestra, MiPerfilPermiso } from "@/types";
import { formatDate, hasModulePermissionByCode } from "@/utils";
import { ACTION_CODES, INITIAL_FORM, INITIAL_ITEM_FORM, INITIAL_RELATION_FORM, MANTENIMIENTO_TABLAS_MODULE_CODE, TABLE_META } from "../constants/mantenimientoConstants";
import type { CatalogFormErrors, CatalogFormState, CatalogRow, FeedbackVariant, ItemFormErrors, ItemFormState, MaintenanceTableKey, RelationFormErrors, RelationFormState } from "../types/mantenimientoTypes";
import { getMetrics, getRowId, getStatusVariant } from "../utils/mantenimientoUtils";

export function useMantenimientoTablasPage() {
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
  const [profilePermissions, setProfilePermissions] = useState<MiPerfilPermiso[]>([]);
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

  const ensureActionPermission = async (actionCode: string, actionLabel: string): Promise<boolean> => {
    let currentPermissions = profilePermissions;

    if (!hasModulePermissionByCode(currentPermissions, MANTENIMIENTO_TABLAS_MODULE_CODE, actionCode)) {
      try {
        const profile = await profileService.getMyProfile();
        currentPermissions = profile.permisos ?? [];
        setProfilePermissions(currentPermissions);
      } catch {
        currentPermissions = profilePermissions;
      }
    }

    const allowed = hasModulePermissionByCode(currentPermissions, MANTENIMIENTO_TABLAS_MODULE_CODE, actionCode);
    if (allowed) {
      return true;
    }

    openFeedbackModal("Acceso denegado", `No tienes permiso para ${actionLabel.toLowerCase()} en esta vista.`, "error");
    return false;
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
                void (async () => {
                  if (!(await ensureActionPermission(ACTION_CODES.edit, "editar"))) {
                    return;
                  }
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
                })();
              }}
              size="sm"
              variant="edit"
            >
              Editar
            </Button>
            <Button
              leftIcon={<Trash2 size={14} />}
              onClick={() => {
                void (async () => {
                  if (!(await ensureActionPermission(ACTION_CODES.delete, row.activo ? "inactivar" : "reactivar"))) {
                    return;
                  }
                setSelectedCatalogRow(row);
                setIsDeleteOpen(true);
                })();
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

  useEffect(() => {
    const loadProfilePermissions = async (): Promise<void> => {
      try {
        const profile = await profileService.getMyProfile();
        setProfilePermissions(profile.permisos ?? []);
      } catch {
        setProfilePermissions([]);
      }
    };

    void loadProfilePermissions();
  }, []);

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

    if (!(await ensureActionPermission(ACTION_CODES.save, "guardar"))) {
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

    if (!(await ensureActionPermission(ACTION_CODES.delete, selectedCatalogRow.activo ? "inactivar" : "reactivar"))) {
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

    if (!(await ensureActionPermission(ACTION_CODES.save, "guardar"))) {
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

    if (!(await ensureActionPermission(ACTION_CODES.delete, selectedItem.activo ? "inactivar" : "reactivar"))) {
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

    if (!(await ensureActionPermission(ACTION_CODES.save, "guardar"))) {
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

    if (!(await ensureActionPermission(ACTION_CODES.delete, selectedRelation.activo ? "inactivar" : "reactivar"))) {
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
                void (async () => {
                  if (!(await ensureActionPermission(ACTION_CODES.edit, "editar"))) {
                    return;
                  }
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
                })();
              }}
              size="sm"
              variant="edit"
            >
              Editar
            </Button>
            <Button
              leftIcon={<Trash2 size={14} />}
              onClick={() => {
                void (async () => {
                  if (!(await ensureActionPermission(ACTION_CODES.delete, row.activo ? "inactivar" : "reactivar"))) {
                    return;
                  }
                setSelectedItem(row);
                setIsItemStatusOpen(true);
                })();
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
                void (async () => {
                  if (!(await ensureActionPermission(ACTION_CODES.edit, "editar"))) {
                    return;
                  }
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
                })();
              }}
              size="sm"
              variant="edit"
            >
              Editar
            </Button>
            <Button
              leftIcon={<Trash2 size={14} />}
              onClick={() => {
                void (async () => {
                  if (!(await ensureActionPermission(ACTION_CODES.delete, row.activo ? "inactivar" : "reactivar"))) {
                    return;
                  }
                setSelectedRelation(row);
                setIsRelationStatusOpen(true);
                })();
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


  return {
    activeTable,
    availableChildItems,
    columns,
    draftSearch,
    ensureActionPermission,
    feedbackMessage,
    feedbackTitle,
    feedbackVariant,
    filteredRows,
    form,
    formErrors,
    handleChangeItemStatus,
    handleChangeRelationStatus,
    handleChangeStatus,
    handleSave,
    handleSaveItem,
    handleSaveRelation,
    isDeleteOpen,
    isFeedbackOpen,
    isFormOpen,
    isItemFormOpen,
    isItemSaving,
    isItemStatusOpen,
    isItemStatusSubmitting,
    isRelationFormOpen,
    isRelationSaving,
    isRelationStatusOpen,
    isRelationStatusSubmitting,
    isSaving,
    isStatusSubmitting,
    itemColumns,
    itemForm,
    itemFormErrors,
    itemMetrics,
    itemSearch,
    itemStatusFilter,
    itemsLoading,
    loadCurrentTable,
    loading,
    masterItems,
    masterTables,
    meta,
    metrics,
    normalizedPage,
    pageSize,
    paginatedItems,
    paginatedRows,
    relationColumns,
    relationForm,
    relationFormErrors,
    relationMetrics,
    relationStatusFilter,
    relationTypeFilter,
    relations,
    relationsLoading,
    selectedCatalogRow,
    selectedItem,
    selectedMasterTable,
    selectedParentItem,
    selectedRelation,
    setActiveTable,
    setDraftSearch,
    setFeedbackMessage,
    setFeedbackTitle,
    setFeedbackVariant,
    setForm,
    setFormErrors,
    setIsDeleteOpen,
    setIsFeedbackOpen,
    setIsFormOpen,
    setIsItemFormOpen,
    setIsItemStatusOpen,
    setIsRelationFormOpen,
    setIsRelationStatusOpen,
    setItemForm,
    setItemFormErrors,
    setItemSearch,
    setItemStatusFilter,
    setPage,
    setPageSize,
    setRelationForm,
    setRelationFormErrors,
    setRelationStatusFilter,
    setRelationTypeFilter,
    setSelectedCatalogRow,
    setSelectedItem,
    setSelectedMasterTable,
    setSelectedParentItem,
    setSelectedRelation,
    setStatusFilter,
    statusFilter,
    total,
  };
}
