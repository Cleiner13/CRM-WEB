import type { Permiso } from "@/types/permisos";

export type Usuario = {
  usuarioId: number;
  empleadoId?: number;
  username: string;
  nombreCompleto?: string;
  emailCoorporativo?: string;
  activo: boolean;
  requiereCambioPassword: boolean;
  ultimoLogin?: Date;
  intentosFallidos: number;
  bloqueadoHasta?: Date;
  areaId?: number;
  areaCodigo?: string;
  areaNombre?: string;
  cargoId?: number;
  cargoCodigo?: string;
  cargoNombre?: string;
  roles: string[];
  permisos: Permiso[];
};

export type LoginResponse = Usuario & {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiraEn: Date;
};

export type CurrentUserResponse = Usuario;
