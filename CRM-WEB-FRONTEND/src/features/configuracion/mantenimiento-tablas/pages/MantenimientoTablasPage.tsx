import { useEffect, useMemo, useState } from "react";
import { Check, Download, Pencil, Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Badge, Button, Card, Input, Modal, Pagination, Select, Table, Textarea, Toast } from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import { cx } from "@/config/styles";
import { moduleService, permissionService, roleService } from "@/services";
import type { AppModule, AppPermission, AppRole } from "@/types";
import { formatDate } from "@/utils";

type MaintenanceTableKey = "modules" | "roles" | "permissions";
type CatalogRow = AppModule | AppRole;
type AnyMaintenanceRow = AppModule | AppRole | AppPermission;
type PermissionActionCode = "VER" | "CREAR" | "EDITAR" | "GUARDAR" | "ELIMINAR" | "EXPORTAR" | "LIMPIAR";

type CatalogFormState = {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  datosExtra: string;
};

type CatalogFormErrors = Partial<Record<keyof Omit<CatalogFormState, "id">, string>>;

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

const INITIAL_FORM: CatalogFormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
  datosExtra: "",
};

const TABLE_OPTIONS = [
  { label: "Modulos", value: "modules" },
  { label: "Roles", value: "roles" },
  { label: "Permisos", value: "permissions" },
] as const;

const TABLE_META: Record<MaintenanceTableKey, TableMeta> = {
  modules: {
    title: "Modulos",
    subtitle: "Catalogo base para sidebar, permisos y navegacion del sistema",
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
    subtitle: "Catalogo base de roles del sistema y sus asignaciones futuras",
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
    subtitle: "Matriz visual por modulo y accion para activar o quitar accesos base",
    badge: "seg.Permisos",
    sourceLabel: "Tabla actual: seg.Permisos",
    searchPlaceholder: "Ej. ADMINISTRACION o VER",
    exportFilename: "permisos.csv",
    createLabel: "Crear permiso",
    editLabel: "Editar permiso",
    deleteLabel: "Eliminar permiso",
  },
};

const PERMISSION_ACTIONS: Array<{ code: PermissionActionCode; label: string }> = [
  { code: "VER", label: "Ver" },
  { code: "CREAR", label: "Crear" },
  { code: "EDITAR", label: "Editar" },
  { code: "GUARDAR", label: "Guardar" },
  { code: "ELIMINAR", label: "Eliminar" },
  { code: "EXPORTAR", label: "Exportar" },
  { code: "LIMPIAR", label: "Limpiar" },
];

function getStatusVariant(active: boolean): "success" | "danger" {
  return active ? "success" : "danger";
}

function getRowId(row: AnyMaintenanceRow): number {
  if ("permisoId" in row) {
    return row.permisoId;
  }

  if ("rolId" in row) {
    return row.rolId;
  }

  return row.moduloId;
}

function buildCsv(rows: AnyMaintenanceRow[]): string {
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active">("active");
  const [modules, setModules] = useState<AppModule[]>([]);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<AppPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCatalogRow, setSelectedCatalogRow] = useState<CatalogRow | null>(null);
  const [form, setForm] = useState<CatalogFormState>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<CatalogFormErrors>({});

  const meta = TABLE_META[activeTable];
  const catalogRows: CatalogRow[] = activeTable === "modules" ? modules : roles;
  const metricsRows = activeTable === "permissions" ? permissions : catalogRows;
  const metrics = useMemo(() => getMetrics(metricsRows), [metricsRows]);

  const paginatedRows = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(catalogRows.length / pageSize));
    const normalizedPage = Math.min(page, totalPages);
    const start = (normalizedPage - 1) * pageSize;
    return catalogRows.slice(start, start + pageSize);
  }, [catalogRows, page, pageSize]);

  const total = catalogRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const normalizedPage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== normalizedPage) {
      setPage(normalizedPage);
    }
  }, [normalizedPage, page]);

  const permissionMatrixRows = useMemo(() => {
    return modules.map((module) => ({
      module,
      actions: PERMISSION_ACTIONS.map((action) => {
        const permission = permissions.find(
          (item) => item.moduloId === module.moduloId && item.codigo.trim().toUpperCase() === action.code && item.activo,
        );

        return {
          ...action,
          permission,
        };
      }),
    }));
  }, [modules, permissions]);

  const columns = useMemo<Array<TableColumn<CatalogRow>>>(
    () => [
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
              variant="delete"
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const loadCurrentTable = async (nextTable = activeTable, nextSearch = search, nextStatus = statusFilter): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (nextTable === "modules") {
        const rows = await moduleService.getAll(nextSearch, nextStatus === "active");
        setModules(rows);
      } else if (nextTable === "roles") {
        const rows = await roleService.getAll(nextSearch, nextStatus === "active");
        setRoles(rows);
      } else {
        const [moduleRows, permissionRows] = await Promise.all([
          moduleService.getAll(nextSearch, nextStatus === "active"),
          permissionService.getAll(undefined, nextSearch, nextStatus === "active"),
        ]);
        setModules(moduleRows);
        setPermissions(permissionRows);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la tabla seleccionada.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCurrentTable(activeTable, "", "active");
    setPage(1);
    setDraftSearch("");
    setSearch("");
    setStatusFilter("active");
    setSelectedCatalogRow(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
  }, [activeTable]);

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
    if (!validateForm() || activeTable === "permissions") {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (activeTable === "modules") {
        await moduleService.save({
          moduloId: form.id,
          codigo: form.codigo.trim(),
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
          datosExtra: form.datosExtra.trim() || null,
        });
      } else {
        await roleService.save({
          rolId: form.id,
          codigo: form.codigo.trim(),
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
          datosExtra: form.datosExtra.trim() || null,
        });
      }

      setSuccess(form.id ? `${meta.title.slice(0, -1)} actualizado correctamente.` : `${meta.title.slice(0, -1)} creado correctamente.`);
      setIsFormOpen(false);
      setSelectedCatalogRow(null);
      setForm(INITIAL_FORM);
      setPage(1);
      await loadCurrentTable(activeTable, search, statusFilter);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : `No se pudo guardar ${meta.title.toLowerCase()}.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!selectedCatalogRow || activeTable === "permissions") {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      if (activeTable === "modules") {
        await moduleService.remove((selectedCatalogRow as AppModule).moduloId);
      } else {
        await roleService.remove((selectedCatalogRow as AppRole).rolId);
      }

      setSuccess(`${meta.title.slice(0, -1)} ${selectedCatalogRow.nombre} eliminado correctamente.`);
      setIsDeleteOpen(false);
      setSelectedCatalogRow(null);
      setPage(1);
      await loadCurrentTable(activeTable, search, statusFilter);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : `No se pudo eliminar ${meta.title.toLowerCase()}.`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePermission = async (module: AppModule, actionCode: PermissionActionCode): Promise<void> => {
    const currentPermission = permissions.find(
      (permission) =>
        permission.moduloId === module.moduloId && permission.codigo.trim().toUpperCase() === actionCode && permission.activo,
    );

    setError(null);

    try {
      if (currentPermission) {
        await permissionService.remove(currentPermission.permisoId);
        setSuccess(`Permiso ${actionCode} quitado de ${module.nombre}.`);
      } else {
        await permissionService.save({
          moduloId: module.moduloId,
          codigo: actionCode,
          nombre: actionCode,
          descripcion: `${actionCode} sobre ${module.nombre}`,
          datosExtra: null,
        });
        setSuccess(`Permiso ${actionCode} asignado a ${module.nombre}.`);
      }

      await loadCurrentTable("permissions", search, statusFilter);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "No se pudo actualizar el permiso.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button
              onClick={() => {
                setSearch(draftSearch.trim());
                setPage(1);
                void loadCurrentTable(activeTable, draftSearch.trim(), statusFilter);
              }}
              variant="search"
            >
              Buscar
            </Button>
            <Button
              onClick={() => {
                setDraftSearch("");
                setSearch("");
                setStatusFilter("active");
                setPage(1);
                void loadCurrentTable(activeTable, "", "active");
              }}
              variant="clear"
            >
              Limpiar
            </Button>
            <Button
              disabled={activeTable === "permissions"}
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
            <Button
              leftIcon={<Download size={16} />}
              onClick={() => downloadCsv(meta.exportFilename, buildCsv(activeTable === "permissions" ? permissions : catalogRows))}
              variant="export"
            >
              Exportar
            </Button>
          </>
        }
        subtitle="Gestion de tablas maestras y catalogos"
        tag="Modulo"
        title="Configuracion - Mantenimiento Tablas"
      />

      {success ? <Toast message={success} onDismiss={() => setSuccess(null)} title="Correcto" variant="success" /> : null}
      {error ? <Toast message={error} onDismiss={() => setError(null)} title="Error" variant="error" /> : null}

      <Card subtitle="Seleccione la tabla que desea mantener" title="Tabla activa">
        <div className="grid gap-4 md:grid-cols-[minmax(260px,320px)_1fr] md:items-end">
          <Select
            label="Tabla maestra"
            onChange={(event) => setActiveTable(event.target.value as MaintenanceTableKey)}
            options={TABLE_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
            value={activeTable}
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">{meta.title}</p>
            <p className="mt-1 text-sm text-slate-500">{meta.subtitle}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#7f1d1d]">{meta.badge}</p>
          </div>
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.85fr)]">
        <Card subtitle={`Busqueda por codigo o nombre de ${meta.title.toLowerCase()}`} title="Filtros">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Buscar"
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder={meta.searchPlaceholder}
              value={draftSearch}
            />
            <Select
              label="Estado"
              onChange={(event) => setStatusFilter(event.target.value as "all" | "active")}
              options={[
                { label: "Solo activos", value: "active" },
                { label: "Todos", value: "all" },
              ]}
              value={statusFilter}
            />
          </div>
          {activeTable === "permissions" ? (
            <div className="mt-4 rounded-xl border border-[#2e0810]/10 bg-[#2e0810]/[0.035] px-4 py-3 text-sm text-slate-600">
              Use la matriz para activar o quitar accesos base por modulo. Cada click crea o elimina el permiso correspondiente.
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                setSearch(draftSearch.trim());
                setPage(1);
                void loadCurrentTable(activeTable, draftSearch.trim(), statusFilter);
              }}
              variant="search"
            >
              Buscar
            </Button>
            <Button
              onClick={() => {
                setDraftSearch("");
                setSearch("");
                setStatusFilter("active");
                setPage(1);
                void loadCurrentTable(activeTable, "", "active");
              }}
              variant="clear"
            >
              Limpiar
            </Button>
          </div>
        </Card>

        <Card subtitle="Resumen rapido del catalogo actual" title="Estado del mantenimiento">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <span className="text-sm text-slate-600">Total de registros</span>
              <Badge variant="neutral">{metrics.total}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <span className="text-sm text-slate-600">Registros activos</span>
              <Badge variant="success">{metrics.active}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <span className="text-sm text-slate-600">Registros inactivos</span>
              <Badge variant="danger">{metrics.inactive}</Badge>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{meta.sourceLabel}</span>
            </div>
          </div>
        </Card>
      </section>

      <Card subtitle={meta.subtitle} title={activeTable === "permissions" ? "Matriz de permisos" : `Listado de ${meta.title.toLowerCase()}`}>
        <div className="space-y-4">
          {loading ? <p className="text-sm text-slate-500">Cargando {meta.title.toLowerCase()}...</p> : null}

          {activeTable === "permissions" ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[#2e2e2e]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">Modulo</th>
                    {PERMISSION_ACTIONS.map((action) => (
                      <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white" key={action.code}>
                        {action.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissionMatrixRows.length === 0 ? (
                    <tr className="border-t border-slate-100 bg-white">
                      <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={PERMISSION_ACTIONS.length + 1}>
                        No hay modulos para mostrar en la matriz de permisos.
                      </td>
                    </tr>
                  ) : (
                    permissionMatrixRows.map(({ module, actions }) => (
                      <tr className="border-t border-slate-100 bg-white transition hover:bg-slate-50" key={module.moduloId}>
                        <td className="px-4 py-3 align-middle">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{module.nombre}</p>
                            <p className="text-xs text-slate-500">{module.codigo}</p>
                          </div>
                        </td>
                        {actions.map((action) => {
                          const isActive = Boolean(action.permission);

                          return (
                            <td className="px-3 py-3 text-center align-middle" key={`${module.moduloId}-${action.code}`}>
                              <button
                                className={cx(
                                  "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition",
                                  isActive
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    : "border-slate-200 bg-white text-slate-400 hover:border-[#2e0810]/25 hover:bg-[#f8f1f3] hover:text-[#2e0810]",
                                )}
                                onClick={() => void handleTogglePermission(module, action.code)}
                                title={`${isActive ? "Quitar" : "Asignar"} permiso ${action.label}`}
                                type="button"
                              >
                                {isActive ? <Check size={18} strokeWidth={2.5} /> : <X size={18} strokeWidth={2.2} />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </Card>

      <Modal
        footer={
          <>
            <Button
              onClick={() => {
                setIsFormOpen(false);
                setSelectedCatalogRow(null);
                setForm(INITIAL_FORM);
                setFormErrors({});
              }}
              variant="clear"
            >
              Cancelar
            </Button>
            <Button loading={isSaving} onClick={() => void handleSave()} variant="create">
              {form.id ? "Guardar cambios" : meta.createLabel}
            </Button>
          </>
        }
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
            placeholder={activeTable === "modules" ? "Ej. CONFIGURACION.USUARIOS" : "Ej. SUPER_ADMIN"}
            value={form.codigo}
          />
          <Input
            errorText={formErrors.nombre}
            label="Nombre"
            onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
            placeholder={activeTable === "modules" ? "Ej. USUARIOS" : "Ej. SUPER ADMIN"}
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
        footer={
          <>
            <Button onClick={() => setIsDeleteOpen(false)} variant="clear">
              Cancelar
            </Button>
            <Button loading={isDeleting} onClick={() => void handleDelete()} variant="delete">
              {meta.deleteLabel}
            </Button>
          </>
        }
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={meta.deleteLabel}
        variant="warning"
      >
        <p className="text-sm text-slate-600">
          {selectedCatalogRow
            ? activeTable === "modules"
              ? `Se eliminara el modulo ${selectedCatalogRow.nombre}. Esta accion afectara su visibilidad en el sidebar y en permisos.`
              : `Se eliminara el rol ${selectedCatalogRow.nombre}. Verifique antes que no tenga asignaciones criticas.`
            : "Seleccione un registro valido para continuar."}
        </p>
      </Modal>
    </div>
  );
}

export default MantenimientoTablasPage;
