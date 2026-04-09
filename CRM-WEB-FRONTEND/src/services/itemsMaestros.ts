import type {
  AppItemMaestro,
  ItemMaestroOperationResponse,
  SaveItemMaestroRequest,
  SaveItemMaestroResponse,
} from "@/types";
import { httpClientDelete, httpClientGet, httpClientPost } from "./httpClient";

export const itemsMaestrosService = {
  async getAll(tablaMaestraId?: number, search?: string, onlyActive = true): Promise<AppItemMaestro[]> {
    const params = new URLSearchParams();

    if (tablaMaestraId != null) {
      params.set("tablaMaestraId", String(tablaMaestraId));
    }

    if (search?.trim()) {
      params.set("buscar", search.trim());
    }

    params.set("soloActivos", String(onlyActive));

    return httpClientGet<AppItemMaestro[]>(`/items-maestros?${params.toString()}`);
  },

  async save(payload: SaveItemMaestroRequest): Promise<SaveItemMaestroResponse> {
    return httpClientPost<SaveItemMaestroResponse>("/items-maestros", payload);
  },

  async remove(itemMaestroId: number): Promise<ItemMaestroOperationResponse> {
    return httpClientDelete<ItemMaestroOperationResponse>(`/items-maestros/${itemMaestroId}`);
  },
};
