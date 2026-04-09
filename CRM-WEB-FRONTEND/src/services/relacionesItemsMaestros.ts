import type {
  AppRelacionItemMaestro,
  RelacionItemMaestroOperationResponse,
  SaveRelacionItemMaestroRequest,
  SaveRelacionItemMaestroResponse,
} from "@/types";
import { httpClientDelete, httpClientGet, httpClientPost } from "./httpClient";

export const relacionesItemsMaestrosService = {
  async getAll(tipoRelacion?: string, itemPadreId?: number, onlyActive = true): Promise<AppRelacionItemMaestro[]> {
    const params = new URLSearchParams();

    if (tipoRelacion?.trim()) {
      params.set("tipoRelacion", tipoRelacion.trim());
    }

    if (itemPadreId != null) {
      params.set("itemPadreId", String(itemPadreId));
    }

    params.set("soloActivos", String(onlyActive));

    return httpClientGet<AppRelacionItemMaestro[]>(`/relaciones-items-maestros?${params.toString()}`);
  },

  async save(payload: SaveRelacionItemMaestroRequest): Promise<SaveRelacionItemMaestroResponse> {
    return httpClientPost<SaveRelacionItemMaestroResponse>("/relaciones-items-maestros", payload);
  },

  async remove(relacionId: number): Promise<RelacionItemMaestroOperationResponse> {
    return httpClientDelete<RelacionItemMaestroOperationResponse>(`/relaciones-items-maestros/${relacionId}`);
  },
};
