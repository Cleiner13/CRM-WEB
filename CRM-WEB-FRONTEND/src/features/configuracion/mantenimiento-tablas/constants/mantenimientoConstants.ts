import type { CatalogFormState, ItemFormState, MaintenanceTableKey, RelationFormState, TableMeta } from "../types/mantenimientoTypes";

export const MANTENIMIENTO_TABLAS_MODULE_CODE = "CONFIGURACION.MANTENIMIENTO_TABLAS";

export const ACTION_CODES = {
  create: "CREAR",
  edit: "EDITAR",
  save: "GUARDAR",
  delete: "ELIMINAR",
  export: "EXPORTAR",
  clear: "LIMPIAR",
} as const;

export const INITIAL_FORM: CatalogFormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
  datosExtra: "",
};

export const INITIAL_ITEM_FORM: ItemFormState = {
  codigo: "",
  nombre: "",
  orden: "",
  datosExtra: "",
};

export const INITIAL_RELATION_FORM: RelationFormState = {
  itemHijoId: "",
  tipoRelacion: "",
  orden: "",
  datosExtra: "",
};

export const TABLE_OPTIONS = [
  { label: "Tablas maestras", value: "masterTables" },
  { label: "Modulos", value: "modules" },
  { label: "Roles", value: "roles" },
  { label: "Permisos", value: "permissions" },
] as const;

export const TABLE_META: Record<MaintenanceTableKey, TableMeta> = {
  masterTables: {
    title: "Tablas maestras",
    subtitle: "Catalogo base para referencias generales y relaciones maestras del sistema",
    badge: "ref.TablasMaestras",
    sourceLabel: "Tabla actual: ref.TablasMaestras",
    searchPlaceholder: "Ej. AREAS, CARGOS o CAMPANIAS",
    exportFilename: "tablas-maestras.csv",
    createLabel: "Crear tabla maestra",
    editLabel: "Editar tabla maestra",
    deleteLabel: "Eliminar tabla maestra",
  },
  modules: {
    title: "Modulos",
    subtitle: "Catalogo base para la navegacion, vistas y estructura funcional del sistema",
    badge: "seg.Modulos",
    sourceLabel: "Tabla actual: seg.Modulos",
    searchPlaceholder: "Ej. CONFIGURACION o USUARIOS",
    exportFilename: "modulos.csv",
    createLabel: "Crear modulo",
    editLabel: "Editar modulo",
    deleteLabel: "Eliminar modulo",
  },
  roles: {
    title: "Roles",
    subtitle: "Catalogo base de roles operativos y administrativos del sistema",
    badge: "seg.Roles",
    sourceLabel: "Tabla actual: seg.Roles",
    searchPlaceholder: "Ej. SUPER ADMIN o RRHH",
    exportFilename: "roles.csv",
    createLabel: "Crear rol",
    editLabel: "Editar rol",
    deleteLabel: "Eliminar rol",
  },
  permissions: {
    title: "Permisos",
    subtitle: "Catalogo de acciones y permisos disponibles para los modulos del sistema",
    badge: "seg.Permisos",
    sourceLabel: "Tabla actual: seg.Permisos",
    searchPlaceholder: "Ej. VER, CREAR, EXPORTAR o DESCARGAR",
    exportFilename: "permisos.csv",
    createLabel: "Crear permiso",
    editLabel: "Editar permiso",
    deleteLabel: "Eliminar permiso",
  },
};
