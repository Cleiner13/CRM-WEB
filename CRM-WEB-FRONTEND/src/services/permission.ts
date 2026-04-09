import type {
  AppPermission,
  PermissionOperationResponse,
  SavePermissionRequest,
  SavePermissionResponse,
} from "@/types";
import { httpClientDelete, httpClientGet, httpClientPost } from "./httpClient";

let permissionsCache: AppPermission[] | null = null;
let permissionsPromise: Promise<AppPermission[]> | null = null;

export const permissionService = {
  async getAll(search?: string, onlyActive = true): Promise<AppPermission[]> {
    const normalizedSearch = search?.trim();
    const canUseCache = !normalizedSearch && onlyActive;

    if (canUseCache && permissionsCache) {
      return permissionsCache;
    }

    if (canUseCache && !permissionsPromise) {
      permissionsPromise = httpClientGet<AppPermission[]>("/permisos").then((permissions) => {
        permissionsCache = permissions;
        return permissions;
      });
    }

    if (!canUseCache) {
      const params = new URLSearchParams();
      if (normalizedSearch) {
        params.set("buscar", normalizedSearch);
      }
      params.set("soloActivos", String(onlyActive));

      return httpClientGet<AppPermission[]>(`/permisos?${params.toString()}`);
    }

    return permissionsPromise as Promise<AppPermission[]>;
  },

  async save(payload: SavePermissionRequest): Promise<SavePermissionResponse> {
    const response = await httpClientPost<SavePermissionResponse>("/permisos", payload);
    this.clearCache();
    return response;
  },

  async remove(permissionId: number): Promise<PermissionOperationResponse> {
    const response = await httpClientDelete<PermissionOperationResponse>(`/permisos/${permissionId}`);
    this.clearCache();
    return response;
  },

  clearCache(): void {
    permissionsCache = null;
    permissionsPromise = null;
  },
};
