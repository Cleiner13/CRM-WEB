import type { SelectOption } from "@/components/ui";
import type { AppItemMaestro, AppTablaMaestra, EmpleadoCompleto, EmpleadoListItem, SaveEmpleadoRequest } from "@/types";
import { EMPTY_FORM } from "../constants/personalConstants";
import type { DocumentMeta, FormField, PersonalFormState } from "../types/personalTypes";

export const normalizeCode = (value?: string | null): string => value?.trim().toUpperCase() ?? "";

export const findTableId = (tables: AppTablaMaestra[], codes: string[]): number | undefined => {
  const normalized = codes.map((item) => normalizeCode(item));
  return tables.find((item) => normalized.includes(normalizeCode(item.codigo)))?.tablaMaestraId;
};

export const toInputDate = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

export const toNumberOrNull = (value: string): number | null => value ? (Number.isFinite(Number(value)) ? Number(value) : null) : null;

export const toBooleanOrNull = (value: string): boolean | null => value === "true" ? true : value === "false" ? false : null;

export const toStringNumber = (value?: number | null): string => value == null ? "" : String(value);

export const fullName = (item: Pick<EmpleadoListItem, "apellidoPaterno" | "apellidoMaterno" | "primerNombre" | "segundoNombre">): string =>
  [item.apellidoPaterno, item.apellidoMaterno, item.primerNombre, item.segundoNombre].filter(Boolean).join(" ") || "-";

export const buildOptions = (items: AppItemMaestro[], emptyLabel: string): SelectOption[] => [
  { label: emptyLabel, value: "" },
  ...items.map((item) => ({ label: item.nombre, value: String(item.itemMaestroId) })),
];

export const buildSavePayload = (form: PersonalFormState): SaveEmpleadoRequest => ({
  tipoDocumentoId: Number(form.tipoDocumentoId),
  numeroDocumento: form.numeroDocumento.trim(),
  apellidoPaterno: form.apellidoPaterno.trim() || null,
  apellidoMaterno: form.apellidoMaterno.trim() || null,
  primerNombre: form.primerNombre.trim() || null,
  segundoNombre: form.segundoNombre.trim() || null,
  fechaNacimiento: form.fechaNacimiento || null,
  edad: form.edad.trim() || null,
  nacionalidad: form.nacionalidad.trim() || null,
  hijos: toBooleanOrNull(form.hijos),
  cantidadHijos: toNumberOrNull(form.cantidadHijos),
  celular: form.celular.trim() || null,
  correoPersonal: form.correoPersonal.trim() || null,
  sexoId: toNumberOrNull(form.sexoId),
  nivelEstudiosId: toNumberOrNull(form.nivelEstudiosId),
  estadoCivilId: toNumberOrNull(form.estadoCivilId),
  datosExtraEmpleado: form.datosExtraEmpleado.trim() || null,
  departamento: form.departamento.trim() || null,
  provincia: form.provincia.trim() || null,
  distrito: form.distrito.trim() || null,
  direccion: form.direccion.trim() || null,
  referenciaDir: form.referenciaDir.trim() || null,
  correoCorporativo: form.correoCorporativo.trim() || null,
  celularEmergencia: form.celularEmergencia.trim() || null,
  datosExtraDireccion: form.datosExtraDireccion.trim() || null,
  origenId: toNumberOrNull(form.origenId),
  referenciaPost: form.referenciaPost.trim() || null,
  areaPostId: toNumberOrNull(form.areaPostId),
  cargoPostId: toNumberOrNull(form.cargoPostId),
  campaniaPostId: toNumberOrNull(form.campaniaPostId),
  productoPostId: toNumberOrNull(form.productoPostId),
  fechaPostulacion: form.fechaPostulacion || null,
  datosExtraPost: form.datosExtraPost.trim() || null,
  jefeEmpleadoId: toNumberOrNull(form.jefeEmpleadoId),
  codigoEjecutivo: form.codigoEjecutivo.trim() || null,
  codigoDial: form.codigoDial.trim() || null,
  codigoPropio: form.codigoPropio.trim() || null,
  generacionId: toNumberOrNull(form.generacionId),
  jornadaId: toNumberOrNull(form.jornadaId),
  turnoId: toNumberOrNull(form.turnoId),
  tipoContratoId: toNumberOrNull(form.tipoContratoId),
  areaId: toNumberOrNull(form.areaId),
  cargoId: toNumberOrNull(form.cargoId),
  tipoProductoId: toNumberOrNull(form.tipoProductoId),
  fechaIngreso: form.fechaIngreso || null,
  bancoId: toNumberOrNull(form.bancoId),
  numeroCuenta: form.numeroCuenta.trim() || null,
  fechaInicioContrato: form.fechaInicioContrato || null,
  fechaFinContrato: form.fechaFinContrato || null,
  empresaId: toNumberOrNull(form.empresaId),
  sueldo: form.sueldo ? Number(form.sueldo) : null,
  fechaCambio: form.fechaCambio || null,
  fechaCese: form.fechaCese || null,
  datosExtraCont: form.datosExtraCont.trim() || null,
  estadoId: toNumberOrNull(form.estadoId),
  subEstadoId: toNumberOrNull(form.subEstadoId),
  comentario: form.comentario.trim() || null,
  datosExtraRegistro: form.datosExtraRegistro.trim() || null,
  parentescoId: toNumberOrNull(form.parentescoId),
  famTipoDocumentoId: toNumberOrNull(form.famTipoDocumentoId),
  famNumeroDocumento: form.famNumeroDocumento.trim() || null,
  famPrimerNombre: form.famPrimerNombre.trim() || null,
  famSegundoNombre: form.famSegundoNombre.trim() || null,
  famApellidoPaterno: form.famApellidoPaterno.trim() || null,
  famApellidoMaterno: form.famApellidoMaterno.trim() || null,
  famSexoId: toNumberOrNull(form.famSexoId),
  famCelular: form.famCelular.trim() || null,
  famDatosExtra: form.famDatosExtra.trim() || null,
  campanias: form.campanias.map((item) => Number(item)),
});

export function mapDetailToForm(detail: EmpleadoCompleto): PersonalFormState {
  const firstFamily = detail.familiares?.[0];

  return {
    ...EMPTY_FORM,
    tipoDocumentoId: toStringNumber(detail.empleado?.tipoDocumentoId),
    numeroDocumento: detail.empleado?.numeroDocumento ?? "",
    apellidoPaterno: detail.empleado?.apellidoPaterno ?? "",
    apellidoMaterno: detail.empleado?.apellidoMaterno ?? "",
    primerNombre: detail.empleado?.primerNombre ?? "",
    segundoNombre: detail.empleado?.segundoNombre ?? "",
    fechaNacimiento: toInputDate(detail.empleado?.fechaNacimiento),
    edad: detail.empleado?.edad ?? "",
    nacionalidad: detail.empleado?.nacionalidad ?? "",
    hijos: detail.empleado?.hijos == null ? "" : String(detail.empleado.hijos),
    cantidadHijos: detail.empleado?.cantidadHijos == null ? "" : String(detail.empleado.cantidadHijos),
    celular: detail.empleado?.celular ?? "",
    correoPersonal: detail.empleado?.correoPersonal ?? "",
    sexoId: toStringNumber(detail.empleado?.sexoId),
    nivelEstudiosId: toStringNumber(detail.empleado?.nivelEstudiosId),
    estadoCivilId: toStringNumber(detail.empleado?.estadoCivilId),
    departamento: detail.direccion?.departamento ?? "",
    provincia: detail.direccion?.provincia ?? "",
    distrito: detail.direccion?.distrito ?? "",
    direccion: detail.direccion?.direccion ?? "",
    referenciaDir: detail.direccion?.referenciaDir ?? "",
    correoCorporativo: detail.direccion?.correoCorporativo ?? "",
    celularEmergencia: detail.direccion?.celularEmergencia ?? "",
    origenId: toStringNumber(detail.postulacion?.origenId),
    referenciaPost: detail.postulacion?.referenciaPost ?? "",
    areaPostId: toStringNumber(detail.postulacion?.areaId),
    cargoPostId: toStringNumber(detail.postulacion?.cargoId),
    campaniaPostId: toStringNumber(detail.postulacion?.campaniaId),
    productoPostId: toStringNumber(detail.postulacion?.productoId),
    fechaPostulacion: toInputDate(detail.postulacion?.fechaPostulacion),
    tipoContratoId: toStringNumber(detail.contratacion?.tipoContratoId),
    areaId: toStringNumber(detail.contratacion?.areaId),
    cargoId: toStringNumber(detail.contratacion?.cargoId),
    tipoProductoId: toStringNumber(detail.contratacion?.tipoProductoId),
    fechaIngreso: toInputDate(detail.contratacion?.fechaIngreso),
    numeroCuenta: detail.contratacion?.numeroCuenta ?? "",
    fechaInicioContrato: toInputDate(detail.contratacion?.fechaInicioContrato),
    fechaFinContrato: toInputDate(detail.contratacion?.fechaFinContrato),
    sueldo: detail.contratacion?.sueldo == null ? "" : String(detail.contratacion.sueldo),
    fechaCambio: toInputDate(detail.contratacion?.fechaCambio),
    fechaCese: toInputDate(detail.contratacion?.fechaCese),
    estadoId: toStringNumber(detail.registro?.estadoId),
    subEstadoId: toStringNumber(detail.registro?.subEstadoId),
    comentario: detail.registro?.comentario ?? "",
    parentescoId: toStringNumber(firstFamily?.parentescoId),
    famTipoDocumentoId: toStringNumber(firstFamily?.tipoDocumentoId),
    famNumeroDocumento: firstFamily?.numeroDocumento ?? "",
    famPrimerNombre: firstFamily?.primerNombre ?? "",
    famSegundoNombre: firstFamily?.segundoNombre ?? "",
    famApellidoPaterno: firstFamily?.apellidoPaterno ?? "",
    famApellidoMaterno: firstFamily?.apellidoMaterno ?? "",
    famSexoId: toStringNumber(firstFamily?.sexoId),
    famCelular: firstFamily?.celular ?? "",
    campanias: (detail.campanias ?? []).filter((item) => item.activo).map((item) => String(item.campaniaItemMaestroId)),
  };
}

export function downloadCsv(filename: string, rows: string[][]): void {
  const content = rows.map((row) => row.map((cell) => `"${String(cell ?? "").split("\"").join("\"\"")}"`).join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function errorFor(field: FormField, errors: Partial<Record<FormField, string>>): string | undefined {
  return errors[field];
}

export function getDocumentMeta(item?: AppItemMaestro | null): DocumentMeta {
  const codigo = normalizeCode(item?.codigo);
  const nombre = normalizeCode(item?.nombre);
  const text = `${codigo} ${nombre}`;

  if (text.includes("DNI")) {
    return { kind: "DNI", label: "DNI", expectedLength: 8, enableLookup: true };
  }

  if (text.includes("CARNET") || text.includes("EXTRANJERIA") || codigo === "CE") {
    return { kind: "CE", label: "Carnet de Extranjeria", expectedLength: 9, enableLookup: false };
  }

  return { kind: "OTRO", label: item?.nombre ?? "documento", expectedLength: null, enableLookup: false };
}

export function splitPeruApiNames(value?: string | null): { primerNombre: string; segundoNombre: string } {
  const tokens = (value ?? "").trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0) return { primerNombre: "", segundoNombre: "" };
  if (tokens.length === 1) return { primerNombre: tokens[0], segundoNombre: "" };

  return { primerNombre: tokens[0], segundoNombre: tokens.slice(1).join(" ") };
}
