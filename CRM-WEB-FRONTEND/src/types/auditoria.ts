export type AuditoriaListItem = {
  logAuditoriaId: number;
  fechaCreacion: string;
  usuarioId: number;
  accion: string;
  entidad: string;
  claveEntidad?: string | null;
  ipAddress?: string | null;
  totalFilas: number;
};

