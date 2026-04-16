import { useEffect, useMemo, useState } from "react";
import { History, KeyRound, Shield, UserX } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import { areasRolesDefaultService, auditoriaService, itemsMaestrosService, profileService, roleService, tablasMaestrasService, userService } from "@/services";
import type {
  AreaRoleDefault,
  AuditoriaListItem,
  AppItemMaestro,
  AppRole,
  MiPerfilPermiso,
  RolePermissionMatrix,
  UserPermissionMatrix,
  UserPermissionOverrideState,
  UsuarioListItem,
} from "@/types";
import { hasModulePermissionByCode } from "@/utils";
import { ACTION_CODES, USUARIOS_MODULE_CODE } from "../constants/usuariosConstants";
import type { ActionType, ModalTone } from "../types/usuariosTypes";
import { code, fullName, groupByModule, sortActions } from "../utils/usuariosUtils";

export function useUsuariosPage() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [areaDefaults, setAreaDefaults] = useState<AreaRoleDefault[]>([]);
  const [areaItems, setAreaItems] = useState<AppItemMaestro[]>([]);
  const [cargoItems, setCargoItems] = useState<AppItemMaestro[]>([]);
  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [areaId, setAreaId] = useState("");
  const [cargoId, setCargoId] = useState("");
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
  const [rolePermissionModalOpen, setRolePermissionModalOpen] = useState(false);
  const [savingAreaRole, setSavingAreaRole] = useState(false);
  const [savingAreaMatrix, setSavingAreaMatrix] = useState(false);
  const [areaPermissionSearch, setAreaPermissionSearch] = useState("");

  const [confirmAction, setConfirmAction] = useState<{ type: ActionType; user: UsuarioListItem } | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; message: string; variant: ModalTone } | null>(null);
  const [profilePermissions, setProfilePermissions] = useState<MiPerfilPermiso[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyUser, setHistoryUser] = useState<UsuarioListItem | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<AuditoriaListItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);

  const ensureActionPermission = async (actionCode: string, actionLabel: string): Promise<boolean> => {
    let currentPermissions = profilePermissions;

    if (!hasModulePermissionByCode(currentPermissions, USUARIOS_MODULE_CODE, actionCode)) {
      try {
        const profile = await profileService.getMyProfile();
        currentPermissions = profile.permisos ?? [];
        setProfilePermissions(currentPermissions);
      } catch {
        currentPermissions = profilePermissions;
      }
    }

    const allowed = hasModulePermissionByCode(currentPermissions, USUARIOS_MODULE_CODE, actionCode);
    if (allowed) {
      return true;
    }

    setFeedback({ title: "Acceso denegado", message: `No tienes permiso para ${actionLabel.toLowerCase()} en esta vista.`, variant: "error" });
    return false;
  };

  useEffect(() => {
    let active = true;
    void Promise.all([
      roleService.getAll(undefined, false),
      areasRolesDefaultService.getAll(undefined, undefined, false),
    ]).then(([nextRoles, nextDefaults]) => {
      if (!active) return;
      setRoles(nextRoles);
      setAreaDefaults(nextDefaults);
    }).catch((error) => {
      if (active) setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudieron cargar las configuraciones base.", variant: "error" });
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    const loadMasterFilters = async (): Promise<void> => {
      try {
        const masterTables = await tablasMaestrasService.getAll(undefined, false);
        const areaTable = masterTables.find((item) => {
          const code = item.codigo.trim().toUpperCase();
          return code === "AREAS" || code === "AREA";
        });
        const cargoTable = masterTables.find((item) => {
          const code = item.codigo.trim().toUpperCase();
          return code === "CARGOS" || code === "CARGO";
        });

        const [nextAreas, nextCargos] = await Promise.all([
          areaTable ? itemsMaestrosService.getAll(areaTable.tablaMaestraId, undefined, true) : Promise.resolve([]),
          cargoTable ? itemsMaestrosService.getAll(cargoTable.tablaMaestraId, undefined, true) : Promise.resolve([]),
        ]);

        if (!active) return;
        setAreaItems(nextAreas);
        setCargoItems(nextCargos);
      } catch (error) {
        if (active) {
          setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudieron cargar los filtros base de area y cargo.", variant: "error" });
        }
      }
    };

    void loadMasterFilters();

    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    void profileService.getMyProfile()
      .then((profile) => {
        if (active) {
          setProfilePermissions(profile.permisos ?? []);
        }
      })
      .catch(() => {
        if (active) {
          setProfilePermissions([]);
        }
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      let active = true;
      setLoading(true);
      const request = {
        pagina: cargoId ? 1 : page,
        tamanio: cargoId ? 5000 : pageSize,
        texto: search.trim(),
        soloActivos: onlyActive,
        areaId: areaId ? Number(areaId) : undefined,
        cargoId: cargoId ? Number(cargoId) : undefined,
        rolId: roleId ? Number(roleId) : undefined,
      };
      void userService.list(request).then((response) => {
        if (!active) return;

        if (cargoId) {
          const filtered = response.items.filter((item) => item.cargoId === Number(cargoId));
          const start = (page - 1) * pageSize;
          setUsers(filtered.slice(start, start + pageSize));
          setTotal(filtered.length);
          return;
        }

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
  }, [search, onlyActive, areaId, cargoId, roleId, page, pageSize]);

  const areaOptions = useMemo(() => {
    const map = new Map<number, string>();
    areaItems.forEach((item) => map.set(item.itemMaestroId, item.nombre));
    areaDefaults.forEach((item) => { if (item.areaId && item.areaNombre) map.set(item.areaId, item.areaNombre); });
    return [{ label: "Todas las areas", value: "" }, ...[...map.entries()].sort((a, b) => a[1].localeCompare(b[1])).map(([value, label]) => ({ label, value: String(value) }))];
  }, [areaDefaults, areaItems]);

  const cargoOptions = useMemo(() => {
    return [{ label: "Todos los cargos", value: "" }, ...cargoItems.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((item) => ({ label: item.nombre, value: String(item.itemMaestroId) }))];
  }, [cargoItems]);

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
    if (!(await ensureActionPermission(ACTION_CODES.save, "guardar"))) return;
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
    if (confirmAction.type === "block" && !(await ensureActionPermission(ACTION_CODES.block, "desactivar"))) return;
    if (confirmAction.type === "reset" && !(await ensureActionPermission(ACTION_CODES.reset, "resetear"))) return;
    setProcessingAction(true);
    try {
      if (confirmAction.type === "block") {
        if (confirmAction.user.activo) {
          await userService.blockAccess(confirmAction.user.usuarioId);
          setFeedback({ title: "Proceso completado", message: "Acceso tecnico bloqueado correctamente.", variant: "info" });
        } else {
          await userService.reactivateAccess(confirmAction.user.usuarioId);
          setFeedback({ title: "Proceso completado", message: "Acceso tecnico reactivado correctamente.", variant: "info" });
        }
      } else if (confirmAction.type === "reset") {
        if (!confirmAction.user.empleadoId || !confirmAction.user.numeroDocumento) throw new Error("El usuario no tiene datos suficientes para resetear credenciales.");
        await userService.resetPasswordByEmployee(confirmAction.user.empleadoId, confirmAction.user.numeroDocumento);
        setFeedback({ title: "Proceso completado", message: "Usuario reseteado correctamente. Debe cambiar su contrasena al ingresar.", variant: "info" });
      }
      const refreshed = await userService.list({
        pagina: cargoId ? 1 : page,
        tamanio: cargoId ? 5000 : pageSize,
        texto: search.trim(),
        soloActivos: onlyActive,
        areaId: areaId ? Number(areaId) : undefined,
        cargoId: cargoId ? Number(cargoId) : undefined,
        rolId: roleId ? Number(roleId) : undefined,
      });
      if (cargoId) {
        const filtered = refreshed.items.filter((item) => item.cargoId === Number(cargoId));
        const start = (page - 1) * pageSize;
        setUsers(filtered.slice(start, start + pageSize));
        setTotal(filtered.length);
      } else {
        setUsers(refreshed.items);
        setTotal(refreshed.totalRecords);
      }
    } catch (error) {
      setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudo ejecutar la accion.", variant: "error" });
    } finally {
      setProcessingAction(false);
      setConfirmAction(null);
    }
  };

  const saveAreaDefault = async (): Promise<void> => {
    if (!areaModalId || !areaRoleToAssign) return;
    if (!(await ensureActionPermission(ACTION_CODES.save, "guardar"))) return;
    setSavingAreaRole(true);
    try {
      await areasRolesDefaultService.save({ areaId: Number(areaModalId), rolId: Number(areaRoleToAssign), datosExtra: null });
      setAreaDefaults(await areasRolesDefaultService.getAll(undefined, undefined, false));
      setAreaPreviewRoleId(Number(areaRoleToAssign));
      setAreaRoleToAssign("");
      setFeedback({ title: "Proceso completado", message: "Rol por defecto del area guardado correctamente.", variant: "info" });
    } catch (error) {
      setFeedback({ title: "No se pudo guardar", message: error instanceof Error ? error.message : "No se pudo guardar el rol por defecto del area.", variant: "error" });
    } finally {
      setSavingAreaRole(false);
    }
  };

  const saveAreaRoleMatrix = async (): Promise<void> => {
    if (!areaPreviewRoleId || !areaRoleMatrix) return;
    if (!(await ensureActionPermission(ACTION_CODES.save, "guardar"))) return;
    setSavingAreaMatrix(true);
    try {
      const result = await roleService.savePermissionMatrix(areaPreviewRoleId, {
        permisos: areaRoleMatrix.permisos.map((item) => ({
          moduloId: item.moduloId,
          permisoId: item.permisoId,
          asignado: item.asignado,
        })),
      });
      setAreaRoleMatrix(result);
      setFeedback({ title: "Proceso completado", message: "Permisos del rol guardados correctamente.", variant: "info" });
    } catch (error) {
      setFeedback({ title: "No se pudo guardar", message: error instanceof Error ? error.message : "No se pudo guardar la matriz del rol.", variant: "error" });
    } finally {
      setSavingAreaMatrix(false);
    }
  };

  const openAreaRolePermissions = async (rolId: number): Promise<void> => {
    setAreaPreviewRoleId(rolId);
    setAreaPermissionSearch("");
    setRolePermissionModalOpen(true);
    try {
      const matrix = await roleService.getPermissionMatrix(rolId);
      setAreaRoleMatrix(matrix);
    } catch (error) {
      setRolePermissionModalOpen(false);
      setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudo cargar la matriz del rol.", variant: "error" });
    }
  };

  const openHistory = async (user: UsuarioListItem): Promise<void> => {
    setHistoryUser(user);
    setHistoryItems([]);
    setHistoryTotal(0);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const result = await auditoriaService.getByUser(user.usuarioId, 1, 100);
      setHistoryItems(result.items);
      setHistoryTotal(result.totalRecords);
    } catch (error) {
      setHistoryModalOpen(false);
      setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudo cargar el historial del usuario.", variant: "error" });
    } finally {
      setHistoryLoading(false);
    }
  };

  const applyUserBulkState = (targetState: UserPermissionOverrideState): void => {
    setUserMatrix((current) =>
      current
        ? {
            ...current,
            permisos: current.permisos.map((item) => {
              const visible = userGroups.some((group) => group.items.some((visibleItem) => visibleItem.moduloId === item.moduloId && visibleItem.permisoId === item.permisoId));
              if (!visible) return item;

              return {
                ...item,
                estadoOverride: targetState,
                esDenegado: targetState === "DENY",
                permitidoEfectivo: targetState === "DENY" ? false : targetState === "ALLOW" ? true : item.heredadoPorRol,
              };
            }),
          }
        : current,
    );
  };

  const applyRoleBulkState = (allowAll: boolean): void => {
    setAreaRoleMatrix((current) =>
      current
        ? {
            ...current,
            permisos: current.permisos.map((item) => {
              const visible = areaGroups.some((group) => group.items.some((visibleItem) => visibleItem.moduloId === item.moduloId && visibleItem.permisoId === item.permisoId));
              return visible ? { ...item, asignado: allowAll } : item;
            }),
          }
        : current,
    );
  };

  const removeAreaDefault = async (id: number): Promise<void> => {
    if (!(await ensureActionPermission(ACTION_CODES.block, "desactivar"))) return;
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
  const areaGroups = useMemo(() => {
    const groups = groupByModule(areaRoleMatrix?.permisos ?? []);
    const term = areaPermissionSearch.trim().toUpperCase();

    if (!term) return groups;

    return groups.filter((group) =>
      group.moduloNombre.toUpperCase().includes(term) ||
      group.moduloCodigo.toUpperCase().includes(term) ||
      group.items.some((item) =>
        code(item.permisoCodigo).includes(term) ||
        (item.permisoNombre || "").toUpperCase().includes(term),
      ),
      );
    }, [areaPermissionSearch, areaRoleMatrix]);
  const allVisibleUserAllow = useMemo(() => userGroups.length > 0 && userGroups.every((group) => group.items.every((item) => item.estadoOverride === "ALLOW")), [userGroups]);
  const allVisibleUserDeny = useMemo(() => userGroups.length > 0 && userGroups.every((group) => group.items.every((item) => item.estadoOverride === "DENY")), [userGroups]);
  const allVisibleRoleAllow = useMemo(() => areaGroups.length > 0 && areaGroups.every((group) => group.items.every((item) => item.asignado)), [areaGroups]);
  const allVisibleRoleDeny = useMemo(() => areaGroups.length > 0 && areaGroups.every((group) => group.items.every((item) => !item.asignado)), [areaGroups]);

  const historyColumns = useMemo<Array<TableColumn<AuditoriaListItem>>>(() => [
    {
      key: "fecha",
      header: "Fecha",
      render: (row) => new Date(row.fechaCreacion).toLocaleString("es-PE"),
    },
    {
      key: "accion",
      header: "Accion",
      render: (row) => row.accion,
    },
    {
      key: "entidad",
      header: "Entidad",
      render: (row) => row.entidad,
    },
    {
      key: "clave",
      header: "Clave",
      render: (row) => row.claveEntidad || "-",
    },
    {
      key: "ip",
      header: "IP",
      render: (row) => row.ipAddress || "-",
    },
  ], []);

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
          <Button leftIcon={<History size={14} />} onClick={() => { void openHistory(row); }} size="sm" variant="paginacion">
            Historial
          </Button>
          <Button leftIcon={<UserX size={14} />} onClick={() => {
            void (async () => {
              if (!(await ensureActionPermission(ACTION_CODES.block, row.activo ? "desactivar" : "reactivar"))) return;
              setConfirmAction({ type: "block", user: row });
            })();
          }} size="sm" variant={row.activo ? "delete" : "create"}>{row.activo ? "Desactivar" : "Reactivar"}</Button>
          <Button leftIcon={<KeyRound size={14} />} onClick={() => {
            void (async () => {
              if (!(await ensureActionPermission(ACTION_CODES.reset, "resetear"))) return;
              setConfirmAction({ type: "reset", user: row });
            })();
          }} size="sm" variant="clear">Resetear pass</Button>
          <Button leftIcon={<Shield size={14} />} onClick={() => {
            void (async () => {
              if (!(await ensureActionPermission(ACTION_CODES.permissions, "abrir permisos"))) return;
              await openPermissions(row);
            })();
          }} size="sm" variant="create">Permisos</Button>
        </div>
      ),
    },
  ], [ensureActionPermission]);


  return {
    areaActions,
    areaGroups,
    areaId,
    areaModalId,
    areaModalOpen,
    areaOptions,
    areaPermissionSearch,
    areaPreviewRoleId,
    areaRoleMatrix,
    areaRoleToAssign,
    allVisibleRoleAllow,
    allVisibleRoleDeny,
    allVisibleUserAllow,
    allVisibleUserDeny,
    applyRoleBulkState,
    applyUserBulkState,
    availableAreaRoles,
    cargoId,
    cargoOptions,
    columns,
    confirmAction,
    ensureActionPermission,
    executeAction,
    feedback,
    historyColumns,
    historyItems,
    historyLoading,
    historyModalOpen,
    historyTotal,
    historyUser,
    loading,
    loadingPermissions,
    onlyActive,
    openAreaRolePermissions,
    page,
    pageSize,
    permissionModalOpen,
    permissionSearch,
    processingAction,
    roleId,
    roleOptions,
    rolePermissionModalOpen,
    roles,
    removeAreaDefault,
    saveAreaDefault,
    saveAreaRoleMatrix,
    savePermissions,
    savingAreaMatrix,
    savingAreaRole,
    savingPermissions,
    search,
    selectedAreaDefaults,
    selectedUser,
    setAreaId,
    setAreaModalId,
    setAreaModalOpen,
    setAreaPermissionSearch,
    setAreaPreviewRoleId,
    setAreaRoleMatrix,
    setAreaRoleToAssign,
    setCargoId,
    setConfirmAction,
    setFeedback,
    setHistoryModalOpen,
    setOnlyActive,
    setPage,
    setPageSize,
    setPermissionModalOpen,
    setPermissionSearch,
    setRolePermissionModalOpen,
    setRoleId,
    setSearch,
    setUserMatrix,
    total,
    userActions,
    userGroups,
    userMatrix,
    users,
  };
}
