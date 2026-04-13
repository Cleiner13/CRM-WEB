import type { AuditoriaListItem, PagedResponse } from "@/types";
import { httpClientGet } from "./httpClient";

export const auditoriaService = {
  async getByUser(usuarioId: number, pagina = 1, tamPagina = 100): Promise<PagedResponse<AuditoriaListItem>> {
    const params = new URLSearchParams();
    params.set("usuarioId", String(usuarioId));
    params.set("pagina", String(pagina));
    params.set("tamPagina", String(tamPagina));
    return httpClientGet<PagedResponse<AuditoriaListItem>>(`/auditoria?${params.toString()}`);
  },
};

