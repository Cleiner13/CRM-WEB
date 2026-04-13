import type {
  EmpleadoBuscarPorDocumento,
  EmpleadoCompleto,
  EmpleadoListItem,
  EmpleadoOperacionResponse,
  ListEmpleadosParams,
  PagedResponse,
  SaveEmpleadoRequest,
  SaveEmpleadoResponse,
} from "@/types";
import { httpClientGet, httpClientPost } from "./httpClient";

function buildEmpleadosQuery(params: ListEmpleadosParams = {}): string {
  const query = new URLSearchParams();

  if (params.pagina) {
    query.set("pagina", String(params.pagina));
  }

  if (params.tamanio) {
    query.set("tamanio", String(params.tamanio));
  }

  if (params.texto?.trim()) {
    query.set("texto", params.texto.trim());
  }

  if (typeof params.soloActivos === "boolean") {
    query.set("soloActivos", String(params.soloActivos));
  }

  if (params.estadoId) {
    query.set("estadoId", String(params.estadoId));
  }

  if (params.areaId) {
    query.set("areaId", String(params.areaId));
  }

  if (params.cargoId) {
    query.set("cargoId", String(params.cargoId));
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export const empleadosService = {
  async list(params: ListEmpleadosParams = {}): Promise<PagedResponse<EmpleadoListItem>> {
    return httpClientGet<PagedResponse<EmpleadoListItem>>(`/empleados/paginado${buildEmpleadosQuery(params)}`);
  },

  async getById(empleadoId: number): Promise<EmpleadoCompleto> {
    return httpClientGet<EmpleadoCompleto>(`/empleados/${empleadoId}`);
  },

  async searchByDocument(numeroDocumento: string, tipoDocumentoId?: number | null): Promise<EmpleadoBuscarPorDocumento | null> {
    const query = new URLSearchParams({ numeroDocumento });
    if (tipoDocumentoId) {
      query.set("tipoDocumentoId", String(tipoDocumentoId));
    }

    try {
      return await httpClientGet<EmpleadoBuscarPorDocumento>(`/empleados/buscar-por-documento?${query.toString()}`);
    } catch (error) {
      if ((error as Error & { status?: number }).status === 404) {
        return null;
      }
      throw error;
    }
  },

  async save(payload: SaveEmpleadoRequest): Promise<SaveEmpleadoResponse> {
    return httpClientPost<SaveEmpleadoResponse>("/empleados/guardar-usuario", payload);
  },

  async deactivate(empleadoId: number): Promise<EmpleadoOperacionResponse> {
    return httpClientPost<EmpleadoOperacionResponse>(`/empleados/${empleadoId}/desactivar`);
  },
};
