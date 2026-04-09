export type AppTablaMaestra = {
  tablaMaestraId: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  datosExtra?: string | null;
  activo: boolean;
  fechaCreacion?: string;
};

export type SaveTablaMaestraRequest = {
  tablaMaestraId?: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  datosExtra?: string | null;
};

export type SaveTablaMaestraResponse = {
  tablaMaestraId: number;
};

export type TablaMaestraOperationResponse = {
  tablaMaestraId: number;
};
