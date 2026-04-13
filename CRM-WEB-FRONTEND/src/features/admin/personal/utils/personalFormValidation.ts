export const FIELD_LABELS = {
  tipoDocumentoId: "Tipo de documento",
  numeroDocumento: "Numero de documento",
  apellidoPaterno: "Apellido paterno",
  apellidoMaterno: "Apellido materno",
  primerNombre: "Primer nombre",
  segundoNombre: "Segundo nombre",
  fechaNacimiento: "Fecha de nacimiento",
  edad: "Edad",
  nacionalidad: "Nacionalidad",
  hijos: "Tiene hijos",
  cantidadHijos: "Cantidad de hijos",
  celular: "Celular",
  correoPersonal: "Correo personal",
  sexoId: "Sexo",
  nivelEstudiosId: "Nivel de estudios",
  estadoCivilId: "Estado civil",
  datosExtraEmpleado: "Datos extra del empleado",
  departamento: "Departamento",
  provincia: "Provincia",
  distrito: "Distrito",
  direccion: "Direccion",
  referenciaDir: "Referencia de direccion",
  correoCorporativo: "Correo corporativo",
  celularEmergencia: "Celular de emergencia",
  datosExtraDireccion: "Datos extra de direccion",
  origenId: "Origen",
  referenciaPost: "Referencia de postulacion",
  areaPostId: "Area postulada",
  cargoPostId: "Cargo postulado",
  campaniaPostId: "Campania postulada",
  productoPostId: "Producto postulado",
  fechaPostulacion: "Fecha de postulacion",
  datosExtraPost: "Datos extra de postulacion",
  jefeEmpleadoId: "Jefe inmediato",
  codigoEjecutivo: "Codigo ejecutivo",
  codigoDial: "Codigo dial",
  codigoPropio: "Codigo propio",
  generacionId: "Generacion",
  jornadaId: "Jornada",
  turnoId: "Turno",
  tipoContratoId: "Tipo de contrato",
  areaId: "Area actual",
  cargoId: "Cargo actual",
  tipoProductoId: "Tipo de producto",
  fechaIngreso: "Fecha de ingreso",
  bancoId: "Banco",
  numeroCuenta: "Numero de cuenta",
  fechaInicioContrato: "Fecha inicio contrato",
  fechaFinContrato: "Fecha fin contrato",
  empresaId: "Empresa",
  sueldo: "Sueldo",
  fechaCambio: "Fecha de cambio",
  fechaCese: "Fecha de cese",
  datosExtraCont: "Datos extra de contratacion",
  estadoId: "Estado",
  subEstadoId: "Subestado",
  comentario: "Comentario",
  datosExtraRegistro: "Datos extra de registro",
  parentescoId: "Parentesco",
  famTipoDocumentoId: "Tipo documento familiar",
  famNumeroDocumento: "Documento familiar",
  famPrimerNombre: "Primer nombre familiar",
  famSegundoNombre: "Segundo nombre familiar",
  famApellidoPaterno: "Apellido paterno familiar",
  famApellidoMaterno: "Apellido materno familiar",
  famSexoId: "Sexo familiar",
  famCelular: "Celular familiar",
  famDatosExtra: "Datos extra del familiar",
  campanias: "Campanias",
} as const;

export const REQUIRED_FIELDS = [
  "tipoDocumentoId", "numeroDocumento", "apellidoPaterno", "apellidoMaterno", "primerNombre",
  "fechaNacimiento", "nacionalidad", "sexoId", "celular", "correoPersonal",
  "departamento", "provincia", "distrito", "direccion", "correoCorporativo",
  "origenId", "areaPostId", "cargoPostId", "campaniaPostId", "productoPostId", "fechaPostulacion",
  "jefeEmpleadoId", "jornadaId", "turnoId", "tipoContratoId", "areaId", "cargoId", "tipoProductoId",
  "fechaIngreso", "bancoId", "numeroCuenta", "fechaInicioContrato", "empresaId", "sueldo",
  "estadoId", "subEstadoId", "parentescoId", "famTipoDocumentoId", "famNumeroDocumento", "famPrimerNombre",
  "famApellidoPaterno", "famSexoId", "famCelular", "campanias",
] as const;

export function isFieldEmpty(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return !String(value ?? "").trim();
}

export function buildFormErrors(missingFields: readonly string[]): Partial<Record<string, string>> {
  return missingFields.reduce<Partial<Record<string, string>>>((acc, field) => {
    acc[field] = "Campo obligatorio.";
    return acc;
  }, {});
}

export function buildMissingFieldsMessage(missingFields: readonly string[]): string {
  return `Completa los siguientes campos: ${missingFields
    .map((field) => FIELD_LABELS[field as keyof typeof FIELD_LABELS] ?? field)
    .join(", ")}.`;
}
