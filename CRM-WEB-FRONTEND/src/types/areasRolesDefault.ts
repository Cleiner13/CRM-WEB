export type AreaRoleDefault = {
  areaRolDefaultId: number;
  areaId: number;
  areaCodigo?: string | null;
  areaNombre?: string | null;
  rolId: number;
  rolCodigo?: string | null;
  rolNombre?: string | null;
  activo: boolean;
  datosExtra?: string | null;
  fechaCreacion?: string;
};

export type SaveAreaRoleDefaultRequest = {
  areaId: number;
  rolId: number;
  datosExtra?: string | null;
};

export type SaveAreaRoleDefaultResponse = {
  areaRolDefaultId: number;
  areaId: number;
  rolId: number;
  activo: boolean;
};

export type AreaRoleDefaultOperationResponse = {
  ok: boolean;
  mensaje: string;
};
