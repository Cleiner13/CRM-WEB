import { useEffect, useMemo, useState } from "react";
import { KeyRound, Shield, UserX } from "lucide-react";
import { Badge, Button, Card, Input, Modal, Pagination, Select, Table } from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import { areasRolesDefaultService, roleService, userService } from "@/services";
import type {
  AreaRoleDefault,
  AppRole,
  RolePermissionMatrix,
  RolePermissionMatrixItem,
  UserPermissionMatrix,
  UserPermissionMatrixItem,
  UserPermissionOverrideState,
  UsuarioListItem,
} from "@/types";

type ModalTone = "info" | "warning" | "error";
type ActionType = "block" | "reset";
type MatrixItem = RolePermissionMatrixItem | UserPermissionMatrixItem;
type MatrixGroup<T extends MatrixItem> = { moduloId: number; moduloNombre: string; moduloCodigo: string; items: T[] };

const ACTION_ORDER = ["VER", "CREAR", "EDITAR", "GUARDAR", "ELIMINAR", "EXPORTAR", "DESCARGAR", "LIMPIAR"];
const code = (value?: string | null) => value?.trim().toUpperCase() || "ACCION";
const nextState = (state: UserPermissionOverrideState): UserPermissionOverrideState => (state === "HEREDAR" ? "ALLOW" : state === "ALLOW" ? "DENY" : "HEREDAR");

function sortActions(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const ia = ACTION_ORDER.indexOf(a);
    const ib = ACTION_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function fullName(user?: Pick<UsuarioListItem, "apellidoPaterno" | "apellidoMaterno" | "primerNombre" | "segundoNombre"> | null): string {
  return [user?.apellidoPaterno, user?.apellidoMaterno, user?.primerNombre, user?.segundoNombre].filter(Boolean).join(" ") || "-";
}

function parseRoleNames(value?: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function groupByModule<T extends MatrixItem>(items: T[]): MatrixGroup<T>[] {
  const map = new Map<number, MatrixGroup<T>>();
  items.forEach((item) => {
    const current = map.get(item.moduloId);
    if (current) current.items.push(item);
    else map.set(item.moduloId, { moduloId: item.moduloId, moduloNombre: item.moduloNombre || `Modulo ${item.moduloId}`, moduloCodigo: item.moduloCodigo || "-", items: [item] });
  });
  return [...map.values()].sort((a, b) => a.moduloNombre.localeCompare(b.moduloNombre));
}

function square(active: boolean, tone: "role" | "allow" | "deny" | "inherit"): JSX.Element {
  const cls =
    tone === "deny"
      ? active ? "border-rose-500 bg-rose-500 justify-start" : "border-rose-200 bg-white justify-start"
      : tone === "allow" || tone === "role"
        ? active ? "border-emerald-500 bg-emerald-500 justify-end" : "border-emerald-200 bg-white justify-start"
        : active ? "border-slate-400 bg-slate-300 justify-end" : "border-slate-200 bg-white justify-start";

  return (
    <span className={`inline-flex h-5 w-9 items-center rounded-[2px] border p-[2px] transition ${cls}`}>
      <span className="h-4 w-4 rounded-[1px] bg-white shadow-sm transition" />
    </span>
  );
}

function userCellClass(item: UserPermissionMatrixItem): string {
  if (getCurrentEffectiveAllowed(item) === false && item.estadoOverride === "DENY") return "border-rose-200 bg-rose-50 text-rose-700";
  if (getCurrentEffectiveAllowed(item)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-slate-200 bg-white text-slate-500";
}

function getCurrentEffectiveAllowed(item: UserPermissionMatrixItem): boolean {
  if (item.estadoOverride === "DENY") return false;
  if (item.estadoOverride === "ALLOW") return true;
  return item.heredadoPorRol;
}

function getEffectiveUserTone(item: UserPermissionMatrixItem): "allow" | "deny" | "inherit" {
  if (item.estadoOverride === "DENY") return "deny";
  if (item.estadoOverride === "ALLOW") return "allow";
  return item.heredadoPorRol ? "allow" : "inherit";
}

function getEffectiveUserLabel(item: UserPermissionMatrixItem): string {
  if (item.estadoOverride === "DENY") return "DENY";
  if (item.estadoOverride === "ALLOW") return "ALLOW";
  if (item.heredadoPorRol) return "ALLOW";
  return "HER";
}

export function UsuariosPage(): JSX.Element {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [areaDefaults, setAreaDefaults] = useState<AreaRoleDefault[]>([]);
  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [areaId, setAreaId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [users, setUsers] = useState<UsuarioListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UsuarioListItem | null>(null);
  const [userMatrix, setUserMatrix] = useState<UserPermissionMatrix | null>(null);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [permissionSearch, setPermissionSearch] = useState("");

  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [areaModalId, setAreaModalId] = useState("");
  const [areaRoleToAssign, setAreaRoleToAssign] = useState("");
  const [areaPreviewRoleId, setAreaPreviewRoleId] = useState<number | null>(null);
  const [areaRoleMatrix, setAreaRoleMatrix] = useState<RolePermissionMatrix | null>(null);
  const [savingAreaRole, setSavingAreaRole] = useState(false);

  const [confirmAction, setConfirmAction] = useState<{ type: ActionType; user: UsuarioListItem } | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; message: string; variant: ModalTone } | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([roleService.getAll(undefined, false), areasRolesDefaultService.getAll(undefined, undefined, false)]).then(([nextRoles, nextDefaults]) => {
      if (!active) return;
      setRoles(nextRoles);
      setAreaDefaults(nextDefaults);
    }).catch((error) => {
      if (active) setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudieron cargar las configuraciones base.", variant: "error" });
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      let active = true;
      setLoading(true);
      void userService.list({
        pagina: page,
        tamanio: pageSize,
        texto: search.trim(),
        soloActivos: onlyActive,
        areaId: areaId ? Number(areaId) : undefined,
        rolId: roleId ? Number(roleId) : undefined,
      }).then((response) => {
        if (!active) return;
        setUsers(response.items);
        setTotal(response.totalRecords);
      }).catch((error) => {
        if (active) setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudieron cargar los usuarios.", variant: "error" });
      }).finally(() => {
        if (active) setLoading(false);
      });
      return () => { active = false; };
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [search, onlyActive, areaId, roleId, page, pageSize]);

  const areaOptions = useMemo(() => {
    const map = new Map<number, string>();
    users.forEach((user) => { if (user.areaId && user.areaNombre) map.set(user.areaId, user.areaNombre); });
    areaDefaults.forEach((item) => { if (item.areaId && item.areaNombre) map.set(item.areaId, item.areaNombre); });
    return [{ label: "Todas las areas", value: "" }, ...[...map.entries()].sort((a, b) => a[1].localeCompare(b[1])).map(([value, label]) => ({ label, value: String(value) }))];
  }, [areaDefaults, users]);

  const roleOptions = useMemo(() => [{ label: "Todos los roles", value: "" }, ...roles.map((role) => ({ label: role.nombre, value: String(role.rolId) }))], [roles]);
  const selectedAreaDefaults = useMemo(() => areaModalId ? areaDefaults.filter((item) => item.areaId === Number(areaModalId) && item.activo) : [], [areaDefaults, areaModalId]);
  const availableAreaRoles = useMemo(() => {
    const assigned = new Set(selectedAreaDefaults.map((item) => item.rolId));
    return roles.filter((role) => !assigned.has(role.rolId));
  }, [roles, selectedAreaDefaults]);

  useEffect(() => {
    if (!areaModalOpen) return;
    const nextPreview = areaPreviewRoleId ?? selectedAreaDefaults[0]?.rolId ?? null;
    setAreaPreviewRoleId(nextPreview);
    if (!nextPreview) {
      setAreaRoleMatrix(null);
      return;
    }
    let active = true;
    void roleService.getPermissionMatrix(nextPreview).then((matrix) => {
      if (active) setAreaRoleMatrix(matrix);
    }).catch((error) => {
      if (active) setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudo cargar la matriz del area.", variant: "error" });
    });
    return () => { active = false; };
  }, [areaModalOpen, areaPreviewRoleId, selectedAreaDefaults]);

  const openPermissions = async (user: UsuarioListItem): Promise<void> => {
    setSelectedUser(user);
    setPermissionModalOpen(true);
    setLoadingPermissions(true);
    try {
      const matrix = await userService.getPermissionMatrix(user.usuarioId);
      setUserMatrix(matrix);
    } catch (error) {
      setPermissionModalOpen(false);
      setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudieron cargar los permisos del usuario.", variant: "error" });
    } finally {
      setLoadingPermissions(false);
    }
  };

  const savePermissions = async (): Promise<void> => {
    if (!selectedUser || !userMatrix) return;
    setSavingPermissions(true);
    try {
      const result = await userService.savePermissionMatrix(selectedUser.usuarioId, {
        permisos: userMatrix.permisos.map((item) => ({ moduloId: item.moduloId, permisoId: item.permisoId, estado: item.estadoOverride, motivo: item.motivo || null })),
      });
      setUserMatrix(result);
      setFeedback({ title: "Proceso completado", message: "Permisos personales guardados correctamente.", variant: "info" });
    } catch (error) {
      setFeedback({ title: "No se pudo guardar", message: error instanceof Error ? error.message : "No se pudieron guardar los permisos.", variant: "error" });
    } finally {
      setSavingPermissions(false);
    }
  };

  const executeAction = async (): Promise<void> => {
    if (!confirmAction) return;
    setProcessingAction(true);
    try {
      if (confirmAction.type === "block") {
        await userService.blockAccess(confirmAction.user.usuarioId);
        setFeedback({ title: "Proceso completado", message: "Acceso tecnico bloqueado correctamente.", variant: "info" });
      } else if (confirmAction.type === "reset") {
        if (!confirmAction.user.empleadoId || !confirmAction.user.numeroDocumento) throw new Error("El usuario no tiene datos suficientes para resetear credenciales.");
        await userService.resetPasswordByEmployee(confirmAction.user.empleadoId, confirmAction.user.numeroDocumento);
        setFeedback({ title: "Proceso completado", message: "Usuario reseteado correctamente. Debe cambiar su contrasena al ingresar.", variant: "info" });
      }
      const refreshed = await userService.list({ pagina: page, tamanio: pageSize, texto: search.trim(), soloActivos: onlyActive, areaId: areaId ? Number(areaId) : undefined, rolId: roleId ? Number(roleId) : undefined });
      setUsers(refreshed.items);
      setTotal(refreshed.totalRecords);
    } catch (error) {
      setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudo ejecutar la accion.", variant: "error" });
    } finally {
      setProcessingAction(false);
      setConfirmAction(null);
    }
  };

  const saveAreaDefault = async (): Promise<void> => {
    if (!areaModalId || !areaRoleToAssign) return;
    setSavingAreaRole(true);
    try {
      await areasRolesDefaultService.save({ areaId: Number(areaModalId), rolId: Number(areaRoleToAssign), datosExtra: null });
      setAreaDefaults(await areasRolesDefaultService.getAll(undefined, undefined, false));
      setAreaRoleToAssign("");
      setFeedback({ title: "Proceso completado", message: "Rol por defecto del area guardado correctamente.", variant: "info" });
    } catch (error) {
      setFeedback({ title: "No se pudo guardar", message: error instanceof Error ? error.message : "No se pudo guardar el rol por defecto del area.", variant: "error" });
    } finally {
      setSavingAreaRole(false);
    }
  };

  const removeAreaDefault = async (id: number): Promise<void> => {
    setSavingAreaRole(true);
    try {
      await areasRolesDefaultService.remove(id);
      setAreaDefaults(await areasRolesDefaultService.getAll(undefined, undefined, false));
      setFeedback({ title: "Proceso completado", message: "Rol por defecto del area inactivado correctamente.", variant: "info" });
    } catch (error) {
      setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudo inactivar el rol por defecto del area.", variant: "error" });
    } finally {
      setSavingAreaRole(false);
    }
  };

  const userActions = useMemo(() => sortActions(Array.from(new Set((userMatrix?.permisos ?? []).map((item) => code(item.permisoCodigo))))), [userMatrix]);
  const userGroups = useMemo(() => {
    const groups = groupByModule(userMatrix?.permisos ?? []);
    const term = permissionSearch.trim().toUpperCase();

    if (!term) return groups;

    return groups.filter((group) =>
      group.moduloNombre.toUpperCase().includes(term) ||
      group.moduloCodigo.toUpperCase().includes(term) ||
      group.items.some((item) =>
        code(item.permisoCodigo).includes(term) ||
        (item.permisoNombre || "").toUpperCase().includes(term),
      ),
    );
  }, [permissionSearch, userMatrix]);
  const areaActions = useMemo(() => sortActions(Array.from(new Set((areaRoleMatrix?.permisos ?? []).map((item) => code(item.permisoCodigo))))), [areaRoleMatrix]);
  const areaGroups = useMemo(() => groupByModule(areaRoleMatrix?.permisos ?? []), [areaRoleMatrix]);

  const columns = useMemo<Array<TableColumn<UsuarioListItem>>>(() => [
    {
      key: "usuario",
      header: "Usuario",
      render: (row) => (
        <div className="text-left">
          <p className="font-semibold text-slate-900">{fullName(row)}</p>
          <p className="text-xs text-slate-500">{row.usuario}</p>
          <p className="text-xs text-slate-500">{row.numeroDocumento || "-"}</p>
        </div>
      ),
    },
    { key: "area", header: "Area", render: (row) => row.areaNombre || "-" },
    { key: "cargo", header: "Cargo", render: (row) => row.cargoNombre || "-" },
    { key: "roles", header: "Roles", render: (row) => row.rolesNombres || "-" },
    {
      key: "estado",
      header: "Estado",
      render: (row) => (
        <div className="flex flex-col items-center gap-2">
          <Badge variant={row.activo ? "success" : "danger"}>{row.activo ? "Acceso activo" : "Acceso bloqueado"}</Badge>
          <Badge variant={row.empleadoActivo ? "neutral" : "warning"}>{row.empleadoActivo ? "Empleado activo" : "Baja laboral"}</Badge>
        </div>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (row) => (
        <div className="flex flex-wrap justify-center gap-2">
          <Button leftIcon={<UserX size={14} />} onClick={() => setConfirmAction({ type: "block", user: row })} size="sm" variant="delete">Desactivar</Button>
          <Button leftIcon={<KeyRound size={14} />} onClick={() => setConfirmAction({ type: "reset", user: row })} size="sm" variant="clear">Resetear pass</Button>
          <Button leftIcon={<Shield size={14} />} onClick={() => void openPermissions(row)} size="sm" variant="create">Permisos</Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      <Card actions={<Button onClick={() => setAreaModalOpen(true)} variant="create">Permisos por area</Button>} bodyClassName="pt-5" className="border-[#dbe6f3] bg-[linear-gradient(180deg,#ffffff,#fbfdff)]" subtitle="Gestion de seguridad tecnica, reseteo de acceso y permisos efectivos." title="Usuarios">
        <div className="grid gap-3 lg:grid-cols-[70px_minmax(0,1fr)_70px_200px_70px_220px_70px_220px_auto] lg:items-center">
          <div className="text-sm font-semibold text-slate-800">Buscar</div>
          <Input containerClassName="space-y-0" hideLabel label="Buscar" onChange={(event) => setSearch(event.target.value)} placeholder="Documento, usuario o nombre" value={search} />
          <div className="text-sm font-semibold text-slate-800">Estado</div>
          <Select containerClassName="space-y-0" hideLabel label="Estado" onChange={(event) => setOnlyActive(event.target.value === "true")} options={[{ label: "Solo activos", value: "true" }, { label: "Todos", value: "false" }]} value={String(onlyActive)} />
          <div className="text-sm font-semibold text-slate-800">Area</div>
          <Select containerClassName="space-y-0" hideLabel label="Area" onChange={(event) => setAreaId(event.target.value)} options={areaOptions} value={areaId} />
          <div className="text-sm font-semibold text-slate-800">Rol</div>
          <Select containerClassName="space-y-0" hideLabel label="Rol" onChange={(event) => setRoleId(event.target.value)} options={roleOptions} value={roleId} />
          <div className="flex justify-end">
            <Button onClick={() => { setSearch(""); setOnlyActive(true); setAreaId(""); setRoleId(""); setPage(1); }} variant="clear">Limpiar</Button>
          </div>
        </div>
      </Card>

      <Card bodyClassName="pt-5" className="border-[#dbe6f3] bg-[linear-gradient(180deg,#ffffff,#fbfdff)]" subtitle="Acciones centrales sobre cada usuario del sistema." title="Tabla de usuarios">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">{loading ? "Cargando usuarios..." : `${total} registros encontrados.`}</p>
          <Table columns={columns} emptyMessage="No hay usuarios para mostrar." getRowKey={(row) => String(row.usuarioId)} rows={users} />
          <Pagination onPageChange={setPage} onPageSizeChange={(value) => { setPageSize(value); setPage(1); }} page={page} pageSize={pageSize} total={total} />
        </div>
      </Card>

      <Modal
        bodyClassName="px-5 py-5 text-sm leading-6 text-slate-700"
        footer={<Button loading={savingPermissions} onClick={() => void savePermissions()} variant="create">Guardar permisos personales</Button>}
        footerClassName="px-5 py-4"
        isOpen={permissionModalOpen}
        onClose={() => { setPermissionModalOpen(false); setPermissionSearch(""); }}
        panelClassName="max-w-[1180px]"
        title="Permisos del usuario"
        variant="info"
      >
        {loadingPermissions ? <p>Cargando permisos del usuario...</p> : selectedUser && userMatrix ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Usuario</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{fullName(selectedUser)}</p>
                <p className="text-sm text-slate-500">{selectedUser.usuario}</p>
                <p className="mt-2 text-sm text-slate-600"><span className="font-semibold text-slate-900">Area:</span> {selectedUser.areaNombre || "-"}</p>
                <p className="mt-1 text-sm text-slate-600"><span className="font-semibold text-slate-900">Cargo:</span> {selectedUser.cargoNombre || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Roles heredados</p>
                <div className="mt-3 flex flex-wrap gap-2">{parseRoleNames(selectedUser.rolesNombres).length === 0 ? <Badge variant="warning">Sin roles visibles</Badge> : parseRoleNames(selectedUser.rolesNombres).map((role) => <Badge key={role} variant="neutral">{role}</Badge>)}</div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs"><Badge variant="neutral">Permisos efectivos del usuario</Badge></div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <Input
                containerClassName="space-y-0"
                hideLabel
                label="Buscar permisos"
                onChange={(event) => setPermissionSearch(event.target.value)}
                placeholder="Buscar modulo, codigo o accion..."
                value={permissionSearch}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="max-h-[52vh] overflow-auto">
              <table className="min-w-[980px] border-collapse">
                <thead>
                  <tr className="bg-[#2e2e2e]">
                    <th className="w-12 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">Modulo</th>
                    {userActions.map((action) => <th className="min-w-[84px] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white" key={action}>{action === "EDITAR" ? "ACTUALIZAR" : action}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {userGroups.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={userActions.length + 2}>
                        No se encontraron modulos o acciones con ese criterio.
                      </td>
                    </tr>
                  ) : userGroups.map((group, index) => (
                    <tr className="border-t border-slate-100 bg-white" key={group.moduloId}>
                      <td className="px-3 py-3 text-center text-sm text-slate-500">{index + 1}</td>
                      <td className="px-4 py-3"><p className="text-sm font-semibold text-slate-900">{group.moduloNombre}</p><p className="text-xs text-slate-500">{group.moduloCodigo}</p></td>
                      {userActions.map((action) => {
                        const cell = group.items.find((item) => code(item.permisoCodigo) === action);
                        if (!cell) return <td className="px-3 py-3 text-center text-slate-300" key={`${group.moduloId}-${action}`}>-</td>;
                        const tone = getEffectiveUserTone(cell);
                        const isActive = getCurrentEffectiveAllowed(cell) || cell.estadoOverride === "DENY";
                        return (
                          <td className="px-3 py-3 text-center" key={`${group.moduloId}-${action}`}>
                            <button
                              className={`inline-flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-1 py-1 text-[10px] ${userCellClass(cell)}`}
                              onClick={() =>
                                setUserMatrix((current) =>
                                  current
                                    ? {
                                        ...current,
                                        permisos: current.permisos.map((item) =>
                                          item.moduloId === cell.moduloId && item.permisoId === cell.permisoId
                                            ? {
                                                ...item,
                                                estadoOverride: nextState(item.estadoOverride),
                                                esDenegado: nextState(item.estadoOverride) === "DENY",
                                                permitidoEfectivo:
                                                  nextState(item.estadoOverride) === "DENY"
                                                    ? false
                                                    : nextState(item.estadoOverride) === "ALLOW"
                                                      ? true
                                                      : item.heredadoPorRol,
                                              }
                                            : item,
                                        ),
                                      }
                                    : current,
                                )
                              }
                              type="button"
                            >
                              {square(isActive, tone)}
                              <span className="font-semibold">{getEffectiveUserLabel(cell)}</span>
                              <span className="opacity-70">{getCurrentEffectiveAllowed(cell) ? "OK" : "NO"}</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        ) : <p>No hay informacion para mostrar.</p>}
      </Modal>

      <Modal footer={<Button loading={savingAreaRole} onClick={() => void saveAreaDefault()} variant="create">Guardar rol por defecto</Button>} isOpen={areaModalOpen} onClose={() => setAreaModalOpen(false)} title="Permisos por area" variant="info">
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
            <Select label="Area" onChange={(event) => setAreaModalId(event.target.value)} options={areaOptions.filter((item) => item.value)} value={areaModalId} />
            <Select label="Rol por defecto" onChange={(event) => setAreaRoleToAssign(event.target.value)} options={[{ label: "Seleccione un rol", value: "" }, ...availableAreaRoles.map((role) => ({ label: role.nombre, value: String(role.rolId) }))]} value={areaRoleToAssign} />
            <Button disabled={!areaModalId || !areaRoleToAssign} loading={savingAreaRole} onClick={() => void saveAreaDefault()} variant="create">Asignar</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">Roles por defecto del area</p>
              {selectedAreaDefaults.length === 0 ? <p className="text-sm text-slate-500">No hay roles asignados a esta area.</p> : selectedAreaDefaults.map((item) => (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3" key={item.areaRolDefaultId}>
                  <button className="text-left" onClick={() => setAreaPreviewRoleId(item.rolId)} type="button"><p className="text-sm font-semibold text-slate-900">{item.rolNombre || item.rolCodigo || `Rol ${item.rolId}`}</p><p className="text-xs text-slate-500">{item.areaNombre || "-"}</p></button>
                  <Button loading={savingAreaRole} onClick={() => void removeAreaDefault(item.areaRolDefaultId)} size="sm" variant="delete">Quitar</Button>
                </div>
              ))}
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">Matriz por rol del area</p>
              {areaRoleMatrix ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <table className="min-w-full border-collapse">
                    <thead><tr className="bg-[#2e2e2e]"><th className="w-12 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white">#</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">Modulo</th>{areaActions.map((action) => <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white" key={action}>{action}</th>)}</tr></thead>
                    <tbody>{areaGroups.map((group, index) => <tr className="border-t border-slate-100 bg-white" key={group.moduloId}><td className="px-3 py-3 text-center text-sm text-slate-500">{index + 1}</td><td className="px-4 py-3"><p className="text-sm font-semibold text-slate-900">{group.moduloNombre}</p><p className="text-xs text-slate-500">{group.moduloCodigo}</p></td>{areaActions.map((action) => <td className="px-3 py-3 text-center" key={`${group.moduloId}-${action}`}>{group.items.find((item) => code(item.permisoCodigo) === action) ? square(Boolean(group.items.find((item) => code(item.permisoCodigo) === action)?.asignado), "role") : "-"}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              ) : <p className="text-sm text-slate-500">Seleccione un rol del area para ver sus permisos base.</p>}
            </div>
          </div>
        </div>
      </Modal>

      <Modal footer={<Button loading={processingAction} onClick={() => void executeAction()} variant={confirmAction?.type === "reset" ? "create" : "delete"}>Confirmar</Button>} isOpen={Boolean(confirmAction)} onClose={() => setConfirmAction(null)} title={confirmAction?.type === "block" ? "Desactivar acceso" : "Resetear contrasena"} variant={confirmAction?.type === "reset" ? "info" : "warning"}>
        <p>{confirmAction?.type === "block" ? `Se bloqueara el acceso tecnico de ${fullName(confirmAction.user)}.` : confirmAction ? `Se reseteara el acceso de ${fullName(confirmAction.user)} usando su documento como credencial inicial.` : ""}</p>
      </Modal>

      <Modal footer={<Button onClick={() => setFeedback(null)} variant="create">Cerrar</Button>} isOpen={Boolean(feedback)} onClose={() => setFeedback(null)} title={feedback?.title || "Mensaje"} variant={feedback?.variant || "info"}>
        <p>{feedback?.message}</p>
      </Modal>
    </div>
  );
}

export default UsuariosPage;
