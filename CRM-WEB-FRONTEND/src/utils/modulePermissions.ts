import type { AppModule, MiPerfilPermiso } from "@/types";

export function isViewPermission(permission: MiPerfilPermiso): boolean {
  const codigo = permission.permisoCodigo?.trim().toUpperCase() ?? "";
  const nombre = permission.permisoNombre?.trim().toUpperCase() ?? "";

  return codigo === "VER" || codigo.endsWith(".VER") || nombre === "VER" || nombre.endsWith(" - VER");
}

export function hasModulePermission(
  permissions: MiPerfilPermiso[],
  moduleId: number,
  action: string,
): boolean {
  const normalizedAction = action.trim().toUpperCase();

  return permissions.some((permission) => {
    if (!permission.permitido || permission.moduloId !== moduleId) {
      return false;
    }

    const codigo = permission.permisoCodigo?.trim().toUpperCase() ?? "";
    const nombre = permission.permisoNombre?.trim().toUpperCase() ?? "";

    return codigo === normalizedAction || codigo.endsWith(`.${normalizedAction}`) || nombre.endsWith(` - ${normalizedAction}`);
  });
}

export function canViewModule(permissions: MiPerfilPermiso[], moduleId: number): boolean {
  return permissions.some(
    (permission) => permission.permitido && permission.moduloId === moduleId && isViewPermission(permission),
  );
}

export function buildModuleCodeMap(modules: AppModule[]): Map<string, AppModule> {
  return new Map(modules.map((module) => [module.codigo.trim().toUpperCase(), module]));
}

export function buildModuleIdMap(modules: AppModule[]): Map<number, AppModule> {
  return new Map(modules.map((module) => [module.moduloId, module]));
}
