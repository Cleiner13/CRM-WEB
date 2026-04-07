export type AppModule = {
  moduloId: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  datosExtra?: string | null;
  activo: boolean;
  fechaCreacion?: string;
  codigoPadre?: string | null;
  nivel: number;
};

export type SaveModuleRequest = {
  moduloId?: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  datosExtra?: string | null;
};

export type SaveModuleResponse = {
  moduloId: number;
  codigo: string;
  nombre: string;
  activo: boolean;
};

export type ModuleOperationResponse = {
  ok: boolean;
  mensaje: string;
};

export type AppRole = {
  rolId: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  datosExtra?: string | null;
  activo: boolean;
  fechaCreacion?: string;
};

export type SaveRoleRequest = {
  rolId?: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  datosExtra?: string | null;
};

export type SaveRoleResponse = {
  rolId: number;
  codigo: string;
  nombre: string;
  activo: boolean;
};

export type RoleOperationResponse = {
  ok: boolean;
  mensaje: string;
};

export type AppPermission = {
  permisoId: number;
  moduloId: number;
  moduloCodigo?: string | null;
  moduloNombre?: string | null;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  datosExtra?: string | null;
  activo: boolean;
  fechaCreacion?: string;
};

export type SavePermissionRequest = {
  permisoId?: number;
  moduloId: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  datosExtra?: string | null;
};

export type SavePermissionResponse = {
  permisoId: number;
  moduloId: number;
  codigo: string;
  nombre: string;
  activo: boolean;
};

export type PermissionOperationResponse = {
  ok: boolean;
  mensaje: string;
};
