import type { AppModule, MiPerfilPermiso } from "@/types";

function normalizeActionAliases(action: string): string[] {
  const normalized = action.trim().toUpperCase();

  if (normalized === "EDITAR" || normalized === "ACTUALIZAR") {
    return ["EDITAR", "ACTUALIZAR"];
  }

  return [normalized];
}

function normalizeModuleCode(moduleCode: string): string {
  return moduleCode.trim().toUpperCase();
}

function matchesModuleCode(permissionModuleCode: string | null | undefined, expectedModuleCode: string): boolean {
  const candidate = normalizeModuleCode(permissionModuleCode ?? "");
  const expected = normalizeModuleCode(expectedModuleCode);

  if (!candidate || !expected) {
    return false;
  }

  if (candidate === expected) {
    return true;
  }

  const candidateParts = candidate.split(".");
  const expectedParts = expected.split(".");

  return candidate.endsWith(`.${expected}`) ||
    expected.endsWith(`.${candidate}`) ||
    candidateParts[candidateParts.length - 1] === expectedParts[expectedParts.length - 1];
}

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
  const normalizedActions = normalizeActionAliases(action);

  return permissions.some((permission) => {
    if (!permission.permitido || permission.moduloId !== moduleId) {
      return false;
    }

    const codigo = permission.permisoCodigo?.trim().toUpperCase() ?? "";
    const nombre = permission.permisoNombre?.trim().toUpperCase() ?? "";

    return normalizedActions.some((normalizedAction) =>
      codigo === normalizedAction ||
      codigo.endsWith(`.${normalizedAction}`) ||
      nombre === normalizedAction ||
      nombre.endsWith(` - ${normalizedAction}`),
    );
  });
}

export function hasModulePermissionByCode(
  permissions: MiPerfilPermiso[],
  moduleCode: string,
  action: string,
): boolean {
  const normalizedActions = normalizeActionAliases(action);

  return permissions.some((permission) => {
    if (!permission.permitido || !matchesModuleCode(permission.moduloCodigo, moduleCode)) {
      return false;
    }

    const codigo = permission.permisoCodigo?.trim().toUpperCase() ?? "";
    const nombre = permission.permisoNombre?.trim().toUpperCase() ?? "";

    return normalizedActions.some((normalizedAction) =>
      codigo === normalizedAction ||
      codigo.endsWith(`.${normalizedAction}`) ||
      nombre === normalizedAction ||
      nombre.endsWith(` - ${normalizedAction}`),
    );
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
