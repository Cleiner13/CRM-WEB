import type {
  AreaRoleDefault,
  AreaRoleDefaultOperationResponse,
  SaveAreaRoleDefaultRequest,
  SaveAreaRoleDefaultResponse,
} from "@/types";
import { httpClientDelete, httpClientGet, httpClientPost } from "./httpClient";

export const areasRolesDefaultService = {
  async getAll(areaId?: number, rolId?: number, onlyActive = true): Promise<AreaRoleDefault[]> {
    const params = new URLSearchParams();

    if (areaId != null) {
      params.set("areaId", String(areaId));
    }

    if (rolId != null) {
      params.set("rolId", String(rolId));
    }

    params.set("soloActivos", String(onlyActive));

    return httpClientGet<AreaRoleDefault[]>(`/areas-roles-default?${params.toString()}`);
  },

  async save(payload: SaveAreaRoleDefaultRequest): Promise<SaveAreaRoleDefaultResponse> {
    return httpClientPost<SaveAreaRoleDefaultResponse>("/areas-roles-default", payload);
  },

  async remove(areaRoleDefaultId: number): Promise<AreaRoleDefaultOperationResponse> {
    return httpClientDelete<AreaRoleDefaultOperationResponse>(`/areas-roles-default/${areaRoleDefaultId}`);
  },
};
