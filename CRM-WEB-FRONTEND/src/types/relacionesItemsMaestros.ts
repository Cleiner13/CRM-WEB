export type AppRelacionItemMaestro = {
  relacionId: number;
  itemPadreId: number;
  itemHijoId: number;
  tipoRelacion: string;
  orden?: number | null;
  datosExtra?: string | null;
  activo: boolean;
  fechaCreacion?: string;
};

export type SaveRelacionItemMaestroRequest = {
  relacionId?: number;
  itemPadreId: number;
  itemHijoId: number;
  tipoRelacion: string;
  orden?: number | null;
  datosExtra?: string | null;
};

export type SaveRelacionItemMaestroResponse = {
  relacionId: number;
};

export type RelacionItemMaestroOperationResponse = {
  relacionId: number;
};
