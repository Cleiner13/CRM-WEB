import type { AppRole, RoleOperationResponse, SaveRoleRequest, SaveRoleResponse } from "@/types";
import { httpClientDelete, httpClientGet, httpClientPost } from "./httpClient";

let rolesCache: AppRole[] | null = null;
let rolesPromise: Promise<AppRole[]> | null = null;

export const roleService = {
  async getAll(search?: string, onlyActive = true): Promise<AppRole[]> {
    const normalizedSearch = search?.trim();

    if (!normalizedSearch && onlyActive && rolesCache) {
      return rolesCache;
    }

    if (!normalizedSearch && onlyActive && !rolesPromise) {
      rolesPromise = httpClientGet<AppRole[]>("/roles").then((roles) => {
        rolesCache = roles;
        return roles;
      });
    }

    if (normalizedSearch || !onlyActive) {
      const params = new URLSearchParams();
      if (normalizedSearch) {
        params.set("buscar", normalizedSearch);
      }
      params.set("soloActivos", String(onlyActive));

      return httpClientGet<AppRole[]>(`/roles?${params.toString()}`);
    }

    return rolesPromise as Promise<AppRole[]>;
  },

  async save(payload: SaveRoleRequest): Promise<SaveRoleResponse> {
    const response = await httpClientPost<SaveRoleResponse>("/roles", payload);
    this.clearCache();
    return response;
  },

  async remove(roleId: number): Promise<RoleOperationResponse> {
    const response = await httpClientDelete<RoleOperationResponse>(`/roles/${roleId}`);
    this.clearCache();
    return response;
  },

  clearCache(): void {
    rolesCache = null;
    rolesPromise = null;
  },
};
