import type { AppModule, AppPermission, AppRole, AppTablaMaestra } from "@/types";

export type MaintenanceTableKey = "masterTables" | "modules" | "roles" | "permissions";
export type CatalogRow = AppModule | AppRole | AppTablaMaestra | AppPermission;

export type CatalogFormState = {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  datosExtra: string;
};

export type CatalogFormErrors = Partial<Record<keyof Omit<CatalogFormState, "id">, string>>;

export type ItemFormState = {
  id?: number;
  codigo: string;
  nombre: string;
  orden: string;
  datosExtra: string;
};

export type ItemFormErrors = Partial<Record<keyof Omit<ItemFormState, "id">, string>>;

export type RelationFormState = {
  id?: number;
  itemHijoId: string;
  tipoRelacion: string;
  orden: string;
  datosExtra: string;
};

export type RelationFormErrors = Partial<Record<keyof Omit<RelationFormState, "id">, string>>;

export type TableMeta = {
  title: string;
  subtitle: string;
  badge: string;
  sourceLabel: string;
  searchPlaceholder: string;
  exportFilename: string;
  createLabel: string;
  editLabel: string;
  deleteLabel: string;
};

export type FeedbackVariant = "info" | "error";
