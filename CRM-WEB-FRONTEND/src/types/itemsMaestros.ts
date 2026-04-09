export type AppItemMaestro = {
  itemMaestroId: number;
  tablaMaestraId: number;
  codigo: string;
  nombre: string;
  orden?: number | null;
  datosExtra?: string | null;
  activo: boolean;
  fechaCreacion?: string;
};

export type SaveItemMaestroRequest = {
  itemMaestroId?: number;
  tablaMaestraId: number;
  codigo: string;
  nombre: string;
  orden?: number | null;
  datosExtra?: string | null;
};

export type SaveItemMaestroResponse = {
  itemMaestroId: number;
};

export type ItemMaestroOperationResponse = {
  itemMaestroId: number;
};
