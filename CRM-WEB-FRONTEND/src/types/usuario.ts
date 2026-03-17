import type { Permiso } from "@/types/permisos";

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  permisos: Permiso[];
};
