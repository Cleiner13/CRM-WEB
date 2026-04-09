import type {
  ListUsersParams,
  OperacionResponse,
  PagedResponse,
  SaveUserPermissionMatrixRequest,
  UserPermissionMatrix,
  UsuarioResetEmpleadoResponse,
  UsuarioDetalle,
  UsuarioListItem,
  UsuarioRol,
  UsuarioRolAsignadoResponse,
} from "@/types";
import { httpClientDelete, httpClientGet, httpClientPost } from "./httpClient";

function buildUsersQuery(params: ListUsersParams = {}): string {
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

  if (params.areaId) {
    query.set("areaId", String(params.areaId));
  }

  if (params.rolId) {
    query.set("rolId", String(params.rolId));
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export const userService = {
  async list(params: ListUsersParams = {}): Promise<PagedResponse<UsuarioListItem>> {
    return httpClientGet<PagedResponse<UsuarioListItem>>(`/usuarios${buildUsersQuery(params)}`);
  },

  async getById(userId: number): Promise<UsuarioDetalle> {
    return httpClientGet<UsuarioDetalle>(`/usuarios/${userId}`);
  },

  async getRoles(userId: number): Promise<UsuarioRol[]> {
    return httpClientGet<UsuarioRol[]>(`/usuarios/${userId}/roles`);
  },

  async assignRole(userId: number, rolId: number): Promise<UsuarioRolAsignadoResponse> {
    return httpClientPost<UsuarioRolAsignadoResponse>(`/usuarios/${userId}/roles`, { rolId });
  },

  async removeRole(userId: number, rolId: number): Promise<OperacionResponse> {
    return httpClientDelete<OperacionResponse>(`/usuarios/${userId}/roles/${rolId}`);
  },

  async getPermissionMatrix(userId: number): Promise<UserPermissionMatrix> {
    return httpClientGet<UserPermissionMatrix>(`/usuarios/${userId}/permisos/matriz`);
  },

  async savePermissionMatrix(userId: number, payload: SaveUserPermissionMatrixRequest): Promise<UserPermissionMatrix> {
    return httpClientPost<UserPermissionMatrix>(`/usuarios/${userId}/permisos/matriz`, payload);
  },

  async blockAccess(userId: number): Promise<OperacionResponse> {
    return httpClientPost<OperacionResponse>(`/usuarios/${userId}/bloquear-acceso`);
  },

  async reactivateAccess(userId: number): Promise<OperacionResponse> {
    return httpClientPost<OperacionResponse>(`/usuarios/${userId}/reactivar-acceso`);
  },

  async resetPasswordByEmployee(empleadoId: number, numeroDocumento: string): Promise<UsuarioResetEmpleadoResponse> {
    return httpClientPost<UsuarioResetEmpleadoResponse>("/usuarios/crear-reset-empleado", {
      empleadoId,
      numeroDocumento,
    });
  },
};
