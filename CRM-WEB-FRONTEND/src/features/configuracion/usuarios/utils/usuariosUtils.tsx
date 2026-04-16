import type { UsuarioListItem, UserPermissionMatrixItem, UserPermissionOverrideState } from "@/types";
import { ACTION_ORDER } from "../constants/usuariosConstants";
import type { MatrixGroup, MatrixItem } from "../types/usuariosTypes";

export const code = (value?: string | null): string => value?.trim().toUpperCase() || "ACCION";

export const nextState = (state: UserPermissionOverrideState): UserPermissionOverrideState =>
  state === "HEREDAR" ? "ALLOW" : state === "ALLOW" ? "DENY" : "HEREDAR";

export function sortActions(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const ia = ACTION_ORDER.indexOf(a);
    const ib = ACTION_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

export function fullName(user?: Pick<UsuarioListItem, "apellidoPaterno" | "apellidoMaterno" | "primerNombre" | "segundoNombre"> | null): string {
  return [user?.apellidoPaterno, user?.apellidoMaterno, user?.primerNombre, user?.segundoNombre].filter(Boolean).join(" ") || "-";
}

export function parseRoleNames(value?: string | null): string[] {
  return (value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

export function groupByModule<T extends MatrixItem>(items: T[]): MatrixGroup<T>[] {
  const map = new Map<number, MatrixGroup<T>>();
  items.forEach((item) => {
    const current = map.get(item.moduloId);
    if (current) {
      current.items.push(item);
    } else {
      map.set(item.moduloId, {
        moduloId: item.moduloId,
        moduloNombre: item.moduloNombre || `Modulo ${item.moduloId}`,
        moduloCodigo: item.moduloCodigo || "-",
        items: [item],
      });
    }
  });
  return [...map.values()].sort((a, b) => a.moduloNombre.localeCompare(b.moduloNombre));
}

export function square(active: boolean, tone: "role" | "allow" | "deny" | "inherit"): JSX.Element {
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

export function getCurrentEffectiveAllowed(item: UserPermissionMatrixItem): boolean {
  if (item.estadoOverride === "DENY") return false;
  if (item.estadoOverride === "ALLOW") return true;
  return item.heredadoPorRol;
}

export function getEffectiveUserTone(item: UserPermissionMatrixItem): "allow" | "deny" | "inherit" {
  if (item.estadoOverride === "DENY") return "deny";
  if (item.estadoOverride === "ALLOW") return "allow";
  return item.heredadoPorRol ? "allow" : "inherit";
}

export function getEffectiveUserLabel(item: UserPermissionMatrixItem): string {
  if (item.estadoOverride === "DENY") return "DENY";
  if (item.estadoOverride === "ALLOW") return "ALLOW";
  if (item.heredadoPorRol) return "ALLOW";
  return "HER";
}

export function userCellClass(item: UserPermissionMatrixItem): string {
  if (getCurrentEffectiveAllowed(item) === false && item.estadoOverride === "DENY") return "border-rose-200 bg-rose-50 text-rose-700";
  if (getCurrentEffectiveAllowed(item)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-slate-200 bg-white text-slate-500";
}

export function roleCellClass(asignado: boolean): string {
  return asignado ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700";
}
