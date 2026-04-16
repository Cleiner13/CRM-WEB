import { Badge, Button, Input, Modal, Select, Table } from "@/components/ui";
import { ACTION_CODES } from "../constants/usuariosConstants";
import { UsuariosFilters } from "../components/UsuariosFilters";
import { UsuariosTableCard } from "../components/UsuariosTableCard";
import { useUsuariosPage } from "../hooks/useUsuariosPage";
import { code, fullName, getCurrentEffectiveAllowed, getEffectiveUserLabel, getEffectiveUserTone, nextState, parseRoleNames, roleCellClass, square, userCellClass } from "../utils/usuariosUtils";

export function UsuariosPage(): JSX.Element {
  const {
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
  } = useUsuariosPage();

  return (
    <div className="space-y-6">
      <UsuariosFilters
        areaId={areaId}
        areaOptions={areaOptions}
        cargoId={cargoId}
        cargoOptions={cargoOptions}
        onAreaChange={(value) => { setAreaId(value); setPage(1); }}
        onCargoChange={(value) => { setCargoId(value); setPage(1); }}
        onClear={() => {
          void (async () => {
            if (!(await ensureActionPermission(ACTION_CODES.clear, "limpiar filtros"))) return;
            setSearch("");
            setOnlyActive(true);
            setAreaId("");
            setCargoId("");
            setRoleId("");
            setPage(1);
          })();
        }}
        onOnlyActiveChange={(value) => { setOnlyActive(value); setPage(1); }}
        onOpenAreaPermissions={() => {
          void (async () => {
            if (!(await ensureActionPermission(ACTION_CODES.permissions, "abrir permisos por area"))) return;
            setAreaModalOpen(true);
          })();
        }}
        onRoleChange={(value) => { setRoleId(value); setPage(1); }}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        onlyActive={onlyActive}
        roleId={roleId}
        roleOptions={roleOptions}
        search={search}
      />

      <UsuariosTableCard
        columns={columns}
        loading={loading}
        onPageChange={setPage}
        onPageSizeChange={(value) => { setPageSize(value); setPage(1); }}
        page={page}
        pageSize={pageSize}
        total={total}
        users={users}
      />

      <Modal
        bodyClassName="px-5 py-5 text-sm leading-6 text-slate-700"
        footer={<Button loading={savingPermissions} onClick={() => void savePermissions()} variant="create">Guardar permisos personales</Button>}
        footerClassName="px-5 py-4"
        isOpen={permissionModalOpen}
        onClose={() => { setPermissionModalOpen(false); setPermissionSearch(""); }}
        panelClassName="max-w-[1000px]"
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
              <div className="space-y-3">
                <Input
                  containerClassName="space-y-0"
                  hideLabel
                  label="Buscar permisos"
                  onChange={(event) => setPermissionSearch(event.target.value)}
                  placeholder="Buscar modulo, codigo o accion..."
                  value={permissionSearch}
                />
                <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                  <label className="inline-flex items-center gap-2">
                    <input checked={allVisibleUserAllow} className="h-4 w-4 rounded border-slate-300" onChange={() => applyUserBulkState("ALLOW")} type="checkbox" />
                    <span>ALLOW todo lo visible</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input checked={allVisibleUserDeny} className="h-4 w-4 rounded border-slate-300" onChange={() => applyUserBulkState("DENY")} type="checkbox" />
                    <span>DENY todo lo visible</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="max-h-[52vh] overflow-auto">
              <table className="min-w-[980px] border-collapse">
                <thead>
                  <tr className="bg-[#2e2e2e]">
                    <th className="w-12 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">Modulo</th>
                      {userActions.map((action) => <th className="min-w-[84px] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white" key={action}>{action}</th>)}
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

      <Modal
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <Button loading={savingAreaRole} onClick={() => void saveAreaDefault()} variant="create">
              Guardar rol por defecto
            </Button>
          </div>
        }
        isOpen={areaModalOpen}
        onClose={() => { setAreaModalOpen(false); setAreaPermissionSearch(""); }}
        panelClassName="max-w-[920px]"
        title="Permisos por area"
        variant="info"
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
            <Select
              label="Area"
              onChange={(event) => {
                setAreaModalId(event.target.value);
                setAreaPreviewRoleId(null);
                setAreaRoleMatrix(null);
                setAreaPermissionSearch("");
              }}
              options={areaOptions.filter((item) => item.value)}
              value={areaModalId}
            />
            <Select label="Rol por defecto" onChange={(event) => setAreaRoleToAssign(event.target.value)} options={[{ label: "Seleccione un rol", value: "" }, ...availableAreaRoles.map((role) => ({ label: role.nombre, value: String(role.rolId) }))]} value={areaRoleToAssign} />
            <Button disabled={!areaModalId || !areaRoleToAssign} loading={savingAreaRole} onClick={() => void saveAreaDefault()} variant="create">Asignar</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">Roles por defecto del area</p>
              {selectedAreaDefaults.length === 0 ? <p className="text-sm text-slate-500">No hay roles asignados a esta area.</p> : selectedAreaDefaults.map((item) => (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3" key={item.areaRolDefaultId}>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-semibold text-slate-900">{item.rolNombre || item.rolCodigo || `Rol ${item.rolId}`}</p>
                    <p className="text-xs text-slate-500">{item.areaNombre || "-"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button onClick={() => void openAreaRolePermissions(item.rolId)} size="sm" variant="clear">Ver permisos de rol</Button>
                    <Button loading={savingAreaRole} onClick={() => void removeAreaDefault(item.areaRolDefaultId)} size="sm" variant="delete">Quitar</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">Vista de permisos del rol</p>
                <p className="text-xs text-slate-500">Asignas el rol al area aqui, y editas sus permisos desde el boton de vista dedicada.</p>
              </div>
              {selectedAreaDefaults.length === 0 ? (
                <p className="text-sm text-slate-500">Seleccione un area con rol asignado para administrar sus permisos base.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">Cada rol del area puede abrirse en una vista dedicada para revisar y cambiar su matriz completa de permisos.</p>
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    Usa el boton <span className="font-semibold text-slate-700">Ver permisos de rol</span> para abrir la matriz completa con buscador y acciones masivas.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        bodyClassName="px-5 py-5 text-sm leading-6 text-slate-700"
        footer={<Button disabled={!areaRoleMatrix || !areaPreviewRoleId} loading={savingAreaMatrix} onClick={() => void saveAreaRoleMatrix()} variant="create">Guardar permisos del rol</Button>}
        footerClassName="px-5 py-4"
        isOpen={rolePermissionModalOpen}
        onClose={() => { setRolePermissionModalOpen(false); setAreaPermissionSearch(""); }}
        panelClassName="max-w-[1000px]"
        title="Permisos del rol"
        variant="info"
      >
        {areaPreviewRoleId && areaRoleMatrix ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Rol</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{roles.find((item) => item.rolId === areaPreviewRoleId)?.nombre || `Rol ${areaPreviewRoleId}`}</p>
                <p className="text-sm text-slate-500">{roles.find((item) => item.rolId === areaPreviewRoleId)?.codigo || "-"}</p>
                <p className="mt-2 text-sm text-slate-600"><span className="font-semibold text-slate-900">Area:</span> {selectedAreaDefaults.find((item) => item.rolId === areaPreviewRoleId)?.areaNombre || areaOptions.find((item) => item.value === areaModalId)?.label || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Resumen</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="neutral">Permisos base del rol</Badge>
                  <Badge variant="neutral">Herencia para usuarios del area</Badge>
                </div>
                <p className="mt-4 text-sm text-slate-600">Los cambios aqui afectaran la herencia por defecto de los usuarios vinculados a este rol.</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="space-y-3">
                <Input
                  containerClassName="space-y-0"
                  hideLabel
                  label="Buscar permisos del rol"
                  onChange={(event) => setAreaPermissionSearch(event.target.value)}
                  placeholder="Buscar modulo, codigo o accion del rol..."
                  value={areaPermissionSearch}
                />
                <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                  <label className="inline-flex items-center gap-2">
                    <input checked={allVisibleRoleAllow} className="h-4 w-4 rounded border-slate-300" onChange={() => applyRoleBulkState(true)} type="checkbox" />
                    <span>ALLOW todo lo visible</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input checked={allVisibleRoleDeny} className="h-4 w-4 rounded border-slate-300" onChange={() => applyRoleBulkState(false)} type="checkbox" />
                    <span>DENY todo lo visible</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="max-h-[52vh] overflow-auto">
                <table className="min-w-[980px] border-collapse">
                  <thead>
                    <tr className="bg-[#2e2e2e]">
                      <th className="w-12 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">Modulo</th>
                      {areaActions.map((action) => <th className="min-w-[84px] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white" key={action}>{action}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {areaGroups.length === 0 ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={areaActions.length + 2}>
                          No se encontraron modulos o acciones con ese criterio.
                        </td>
                      </tr>
                    ) : areaGroups.map((group, index) => (
                      <tr className="border-t border-slate-100 bg-white" key={group.moduloId}>
                        <td className="px-3 py-3 text-center text-sm text-slate-500">{index + 1}</td>
                        <td className="px-4 py-3"><p className="text-sm font-semibold text-slate-900">{group.moduloNombre}</p><p className="text-xs text-slate-500">{group.moduloCodigo}</p></td>
                        {areaActions.map((action) => {
                          const cell = group.items.find((item) => code(item.permisoCodigo) === action);
                          if (!cell) return <td className="px-3 py-3 text-center text-slate-300" key={`${group.moduloId}-${action}`}>-</td>;
                          return (
                            <td className="px-3 py-3 text-center" key={`${group.moduloId}-${action}`}>
                              <button
                                className={`inline-flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-1 py-1 text-[10px] ${roleCellClass(cell.asignado)}`}
                                onClick={() =>
                                  setAreaRoleMatrix((current) =>
                                    current
                                      ? {
                                          ...current,
                                          permisos: current.permisos.map((item) =>
                                            item.moduloId === cell.moduloId && item.permisoId === cell.permisoId
                                              ? { ...item, asignado: !item.asignado }
                                              : item,
                                          ),
                                        }
                                      : current,
                                  )
                                }
                                type="button"
                              >
                                {square(true, cell.asignado ? "allow" : "deny")}
                                <span className="font-semibold">{cell.asignado ? "ALLOW" : "DENY"}</span>
                                <span className="opacity-70">{cell.asignado ? "OK" : "NO"}</span>
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

      <Modal footer={<Button loading={processingAction} onClick={() => void executeAction()} variant={confirmAction?.type === "reset" ? "create" : confirmAction?.user.activo ? "delete" : "create"}>Confirmar</Button>} isOpen={Boolean(confirmAction)} onClose={() => setConfirmAction(null)} title={confirmAction?.type === "block" ? confirmAction.user.activo ? "Desactivar acceso" : "Reactivar acceso" : "Resetear contrasena"} variant={confirmAction?.type === "reset" ? "info" : "warning"}>
        <p>{confirmAction?.type === "block" ? confirmAction.user.activo ? `Se bloqueara el acceso tecnico de ${fullName(confirmAction.user)}.` : `Se reactivara el acceso tecnico de ${fullName(confirmAction.user)}.` : confirmAction ? `Se reseteara el acceso de ${fullName(confirmAction.user)} usando su documento como credencial inicial.` : ""}</p>
      </Modal>

      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        panelClassName="max-w-[940px]"
        title="Historial del usuario"
        variant="info"
      >
        <div className="space-y-4">
          {historyUser ? (
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-lg font-semibold text-slate-900">{fullName(historyUser)}</p>
              <p className="text-sm text-slate-500">{historyUser.usuario}</p>
              <p className="mt-1 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Area:</span> {historyUser.areaNombre || "-"}
              </p>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {historyLoading ? "Cargando historial..." : `${historyTotal} registros encontrados.`}
            </p>
          </div>

          <Table
            className="max-h-[52vh] overflow-auto"
            columns={historyColumns}
            emptyMessage="No hay historial para este usuario."
            getRowKey={(row) => String(row.logAuditoriaId)}
            rows={historyItems}
          />
        </div>
      </Modal>

      <Modal footer={<Button onClick={() => setFeedback(null)} variant="create">Cerrar</Button>} isOpen={Boolean(feedback)} onClose={() => setFeedback(null)} title={feedback?.title || "Mensaje"} variant={feedback?.variant || "info"}>
        <p>{feedback?.message}</p>
      </Modal>
    </div>
  );
}

export default UsuariosPage;
