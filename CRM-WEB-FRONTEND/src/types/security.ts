export type PagedResponse<TItem> = {
  items: TItem[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
};

export type UsuarioListItem = {
  usuarioId: number;
  empleadoId?: number | null;
  usuario: string;
  debeCambiarPassword: boolean;
  intentosFallidos: number;
  bloqueoHasta?: string | null;
  ultimoLogin?: string | null;
  activo: boolean;
  numeroDocumento?: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  primerNombre?: string | null;
  segundoNombre?: string | null;
  celular?: string | null;
  correoPersonal?: string | null;
  empleadoActivo?: boolean | null;
  areaId?: number | null;
  areaCodigo?: string | null;
  areaNombre?: string | null;
  cargoId?: number | null;
  cargoCodigo?: string | null;
  cargoNombre?: string | null;
  cantidadRoles?: number | null;
  rolesNombres?: string | null;
  fechaCreacion: string;
  fechaModificacion?: string | null;
};

export type UsuarioDetalle = {
  usuarioId: number;
  empleadoId?: number | null;
  usuario: string;
  debeCambiarPassword: boolean;
  intentosFallidos: number;
  bloqueoHasta?: string | null;
  ultimoLogin?: string | null;
  activo: boolean;
  numeroDocumento?: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  primerNombre?: string | null;
  segundoNombre?: string | null;
  celular?: string | null;
  correoPersonal?: string | null;
  emailCoorporativo?: string | null;
  areaId?: number | null;
  areaCodigo?: string | null;
  areaNombre?: string | null;
  cargoId?: number | null;
  cargoCodigo?: string | null;
  cargoNombre?: string | null;
  tipoProductoId?: number | null;
  tipoProductoCodigo?: string | null;
  tipoProductoNombre?: string | null;
  fechaCreacion: string;
  fechaModificacion?: string | null;
};

export type UsuarioRol = {
  usuarioRolId: number;
  usuarioId: number;
  rolId: number;
  rolCodigo?: string | null;
  rolNombre?: string | null;
  rolDescripcion?: string | null;
  activo: boolean;
  fechaCreacion: string;
};

export type UsuarioRolAsignadoResponse = {
  usuarioRolId: number;
  usuarioId: number;
  rolId: number;
  activo: boolean;
};

export type OperacionResponse = {
  ok: boolean;
  mensaje: string;
};

export type UserPermissionOverrideState = "HEREDAR" | "ALLOW" | "DENY";

export type RolePermissionMatrixItem = {
  moduloId: number;
  moduloCodigo?: string | null;
  moduloNombre?: string | null;
  permisoId: number;
  permisoCodigo?: string | null;
  permisoNombre?: string | null;
  asignado: boolean;
};

export type RolePermissionMatrix = {
  rolId: number;
  permisos: RolePermissionMatrixItem[];
};

export type SaveRolePermissionMatrixRequest = {
  permisos: Array<{
    moduloId: number;
    permisoId: number;
    asignado: boolean;
  }>;
};

export type UserPermissionMatrixItem = {
  moduloId: number;
  moduloCodigo?: string | null;
  moduloNombre?: string | null;
  permisoId: number;
  permisoCodigo?: string | null;
  permisoNombre?: string | null;
  heredadoPorRol: boolean;
  estadoOverride: UserPermissionOverrideState;
  esDenegado: boolean;
  permitidoEfectivo: boolean;
  motivo?: string | null;
};

export type UserPermissionMatrix = {
  usuarioId: number;
  permisos: UserPermissionMatrixItem[];
};

export type SaveUserPermissionMatrixRequest = {
  permisos: Array<{
    moduloId: number;
    permisoId: number;
    estado: UserPermissionOverrideState;
    motivo?: string | null;
  }>;
};

export type ListUsersParams = {
  pagina?: number;
  tamanio?: number;
  texto?: string;
  soloActivos?: boolean;
  areaId?: number;
  rolId?: number;
};
