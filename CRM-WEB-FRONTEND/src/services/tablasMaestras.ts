import type {
  AppTablaMaestra,
  SaveTablaMaestraRequest,
  SaveTablaMaestraResponse,
  TablaMaestraOperationResponse,
} from "@/types";
import { httpClientDelete, httpClientGet, httpClientPost } from "./httpClient";

export const tablasMaestrasService = {
  async getAll(search?: string, onlyActive = true): Promise<AppTablaMaestra[]> {
    const normalizedSearch = search?.trim();
    const params = new URLSearchParams();

    if (normalizedSearch) {
      params.set("buscar", normalizedSearch);
    }

    params.set("soloActivos", String(onlyActive));

    return httpClientGet<AppTablaMaestra[]>(`/tablas-maestras?${params.toString()}`);
  },

  async save(payload: SaveTablaMaestraRequest): Promise<SaveTablaMaestraResponse> {
    return httpClientPost<SaveTablaMaestraResponse>("/tablas-maestras", payload);
  },

  async remove(tablaMaestraId: number): Promise<TablaMaestraOperationResponse> {
    return httpClientDelete<TablaMaestraOperationResponse>(`/tablas-maestras/${tablaMaestraId}`);
  },
};
