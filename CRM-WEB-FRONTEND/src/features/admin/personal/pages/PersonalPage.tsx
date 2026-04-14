import { useEffect, useMemo, useState } from "react";
import { FileSpreadsheet, Pencil, Plus, UserX } from "lucide-react";
import { Badge, Button, Card, Input, Modal, Pagination, Select, Table, Textarea } from "@/components/ui";
import type { SelectOption, TableColumn } from "@/components/ui";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import { empleadosService, itemsMaestrosService, profileService, tablasMaestrasService } from "@/services";
import type { AppItemMaestro, AppTablaMaestra, EmpleadoCompleto, EmpleadoListItem, ListEmpleadosParams, MiPerfilPermiso, SaveEmpleadoRequest } from "@/types";
import { formatDate, hasModulePermissionByCode } from "@/utils";
import { buildFormErrors, buildMissingFieldsMessage, isFieldEmpty, REQUIRED_FIELDS } from "../utils/personalFormValidation";

type ModalTone = "info" | "warning" | "error";
type FormField = keyof PersonalFormState;
type DocumentGate = "idle" | "checking" | "existing" | "ready" | "invalid";
type MasterCollections = {
  tipoDocumentoItems: AppItemMaestro[];
  sexoItems: AppItemMaestro[];
  areaItems: AppItemMaestro[];
  cargoItems: AppItemMaestro[];
  estadoItems: AppItemMaestro[];
  subEstadoItems: AppItemMaestro[];
  estadoCivilItems: AppItemMaestro[];
  nivelEstudiosItems: AppItemMaestro[];
  origenItems: AppItemMaestro[];
  campaniaItems: AppItemMaestro[];
  productoItems: AppItemMaestro[];
  generacionItems: AppItemMaestro[];
  jornadaItems: AppItemMaestro[];
  turnoItems: AppItemMaestro[];
  tipoContratoItems: AppItemMaestro[];
  bancoItems: AppItemMaestro[];
  empresaItems: AppItemMaestro[];
  parentescoItems: AppItemMaestro[];
};
type PersonalFormState = {
  tipoDocumentoId: string; numeroDocumento: string; apellidoPaterno: string; apellidoMaterno: string; primerNombre: string; segundoNombre: string;
  fechaNacimiento: string; edad: string; nacionalidad: string; hijos: string; cantidadHijos: string; celular: string; correoPersonal: string;
  sexoId: string; nivelEstudiosId: string; estadoCivilId: string; datosExtraEmpleado: string; departamento: string; provincia: string; distrito: string;
  direccion: string; referenciaDir: string; correoCorporativo: string; celularEmergencia: string; datosExtraDireccion: string; origenId: string;
  referenciaPost: string; areaPostId: string; cargoPostId: string; campaniaPostId: string; productoPostId: string; fechaPostulacion: string;
  datosExtraPost: string; jefeEmpleadoId: string; codigoEjecutivo: string; codigoDial: string; codigoPropio: string; generacionId: string;
  jornadaId: string; turnoId: string; tipoContratoId: string; areaId: string; cargoId: string; tipoProductoId: string; fechaIngreso: string;
  bancoId: string; numeroCuenta: string; fechaInicioContrato: string; fechaFinContrato: string; empresaId: string; sueldo: string; fechaCambio: string;
  fechaCese: string; datosExtraCont: string; estadoId: string; subEstadoId: string; comentario: string; datosExtraRegistro: string;
  parentescoId: string; famTipoDocumentoId: string; famNumeroDocumento: string; famPrimerNombre: string; famSegundoNombre: string;
  famApellidoPaterno: string; famApellidoMaterno: string; famSexoId: string; famCelular: string; famDatosExtra: string; campanias: string[];
};

const PERSONAL_MODULE_CODE = "ADMINISTRACION.PERSONAL";
const ACTION_CODES = { create: "CREAR", edit: "EDITAR", save: "GUARDAR", delete: "ELIMINAR", export: "EXPORTAR", clear: "LIMPIAR" } as const;
const EMPTY_FORM: PersonalFormState = {
  tipoDocumentoId: "", numeroDocumento: "", apellidoPaterno: "", apellidoMaterno: "", primerNombre: "", segundoNombre: "",
  fechaNacimiento: "", edad: "", nacionalidad: "", hijos: "", cantidadHijos: "", celular: "", correoPersonal: "", sexoId: "", nivelEstudiosId: "",
  estadoCivilId: "", datosExtraEmpleado: "", departamento: "", provincia: "", distrito: "", direccion: "", referenciaDir: "", correoCorporativo: "",
  celularEmergencia: "", datosExtraDireccion: "", origenId: "", referenciaPost: "", areaPostId: "", cargoPostId: "", campaniaPostId: "",
  productoPostId: "", fechaPostulacion: "", datosExtraPost: "", jefeEmpleadoId: "", codigoEjecutivo: "", codigoDial: "", codigoPropio: "",
  generacionId: "", jornadaId: "", turnoId: "", tipoContratoId: "", areaId: "", cargoId: "", tipoProductoId: "", fechaIngreso: "", bancoId: "",
  numeroCuenta: "", fechaInicioContrato: "", fechaFinContrato: "", empresaId: "", sueldo: "", fechaCambio: "", fechaCese: "", datosExtraCont: "",
  estadoId: "", subEstadoId: "", comentario: "", datosExtraRegistro: "", parentescoId: "", famTipoDocumentoId: "", famNumeroDocumento: "",
  famPrimerNombre: "", famSegundoNombre: "", famApellidoPaterno: "", famApellidoMaterno: "", famSexoId: "", famCelular: "", famDatosExtra: "", campanias: [],
};
const EMPTY_MASTERS: MasterCollections = {
  tipoDocumentoItems: [], sexoItems: [], areaItems: [], cargoItems: [], estadoItems: [], subEstadoItems: [], estadoCivilItems: [], nivelEstudiosItems: [],
  origenItems: [], campaniaItems: [], productoItems: [], generacionItems: [], jornadaItems: [], turnoItems: [], tipoContratoItems: [], bancoItems: [],
  empresaItems: [], parentescoItems: [],
};

const normalizeCode = (value?: string | null): string => value?.trim().toUpperCase() ?? "";
const findTableId = (tables: AppTablaMaestra[], codes: string[]): number | undefined => {
  const normalized = codes.map((item) => normalizeCode(item));
  return tables.find((item) => normalized.includes(normalizeCode(item.codigo)))?.tablaMaestraId;
};
const toInputDate = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};
const toNumberOrNull = (value: string): number | null => value ? (Number.isFinite(Number(value)) ? Number(value) : null) : null;
const toBooleanOrNull = (value: string): boolean | null => value === "true" ? true : value === "false" ? false : null;
const toStringNumber = (value?: number | null): string => value == null ? "" : String(value);
const fullName = (item: Pick<EmpleadoListItem, "apellidoPaterno" | "apellidoMaterno" | "primerNombre" | "segundoNombre">): string =>
  [item.apellidoPaterno, item.apellidoMaterno, item.primerNombre, item.segundoNombre].filter(Boolean).join(" ") || "-";
const buildOptions = (items: AppItemMaestro[], emptyLabel: string): SelectOption[] => [{ label: emptyLabel, value: "" }, ...items.map((item) => ({ label: item.nombre, value: String(item.itemMaestroId) }))];
function buildSavePayload(form: PersonalFormState): SaveEmpleadoRequest {
  return {
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
  };
}

function mapDetailToForm(detail: EmpleadoCompleto): PersonalFormState {
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

function downloadCsv(filename: string, rows: string[][]): void {
  const content = rows.map((row) => row.map((cell) => `"${String(cell ?? "").split("\"").join("\"\"")}"`).join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }): JSX.Element {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function errorFor(field: FormField, errors: Partial<Record<FormField, string>>): string | undefined {
  return errors[field];
}

export function PersonalPage(): JSX.Element {
  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [areaId, setAreaId] = useState("");
  const [cargoId, setCargoId] = useState("");
  const [estadoId, setEstadoId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmpleadoListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [employeeOptions, setEmployeeOptions] = useState<EmpleadoListItem[]>([]);
  const [masters, setMasters] = useState<MasterCollections>(EMPTY_MASTERS);
  const [profilePermissions, setProfilePermissions] = useState<MiPerfilPermiso[]>([]);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [employeeModalMode, setEmployeeModalMode] = useState<"create" | "edit">("create");
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [form, setForm] = useState<PersonalFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<FormField, string>>>({});
  const [documentGate, setDocumentGate] = useState<DocumentGate>("idle");
  const [documentGateMessage, setDocumentGateMessage] = useState("Seleccione tipo de documento e ingrese el numero para habilitar la ficha.");
  const [confirmDeactivate, setConfirmDeactivate] = useState<EmpleadoListItem | null>(null);
  const [processingDeactivate, setProcessingDeactivate] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; message: string; variant: ModalTone } | null>(null);

  const setField = <K extends keyof PersonalFormState>(field: K, value: PersonalFormState[K]): void => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const selectedTipoDocumento = useMemo(
    () => masters.tipoDocumentoItems.find((item) => String(item.itemMaestroId) === form.tipoDocumentoId),
    [form.tipoDocumentoId, masters.tipoDocumentoItems],
  );

  const documentMeta = useMemo(
    () => getDocumentMeta(selectedTipoDocumento),
    [selectedTipoDocumento],
  );

  const numeroDocumentoDisabled = employeeModalMode === "edit"
    ? true
    : !form.tipoDocumentoId;

  const isSelectedDni = useMemo(() => {
  const codigo = normalizeCode(selectedTipoDocumento?.codigo);
  const nombre = normalizeCode(selectedTipoDocumento?.nombre);

  return codigo.includes("DNI") || nombre.includes("DNI");
  }, [selectedTipoDocumento]);

  const ensureActionPermission = async (actionCode: string, actionLabel: string): Promise<boolean> => {
    let currentPermissions = profilePermissions;
    if (!hasModulePermissionByCode(currentPermissions, PERSONAL_MODULE_CODE, actionCode)) {
      try {
        const profile = await profileService.getMyProfile();
        currentPermissions = profile.permisos ?? [];
        setProfilePermissions(currentPermissions);
      } catch {
        currentPermissions = profilePermissions;
      }
    }
    const allowed = hasModulePermissionByCode(currentPermissions, PERSONAL_MODULE_CODE, actionCode);
    if (allowed) return true;
    setFeedback({ title: "Acceso denegado", message: `No tienes permiso para ${actionLabel.toLowerCase()} en esta vista.`, variant: "error" });
    return false;
  };

  const loadEmployees = async (paramsOverride?: Partial<ListEmpleadosParams>): Promise<void> => {
    setLoading(true);
    try {
      const response = await empleadosService.list({
        pagina: page,
        tamanio: pageSize,
        texto: search.trim() || undefined,
        soloActivos: onlyActive,
        estadoId: estadoId ? Number(estadoId) : undefined,
        areaId: areaId ? Number(areaId) : undefined,
        cargoId: cargoId ? Number(cargoId) : undefined,
        ...paramsOverride,
      });
      setEmployees(response.items);
      setTotal(response.totalRecords);
    } catch (error) {
      setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudo cargar el personal.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void profileService.getMyProfile().then((profile) => {
      if (active) setProfilePermissions(profile.permisos ?? []);
    }).catch(() => {
      if (active) setProfilePermissions([]);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const loadMasters = async (): Promise<void> => {
      try {
        const tables = await tablasMaestrasService.getAll(undefined, true);
        const tableIds = {
          area: findTableId(tables, ["AREA", "AREAS"]),
          cargo: findTableId(tables, ["CARGO", "CARGOS"]),
          estado: findTableId(tables, ["ESTADO", "ESTADOS", "ESTADO_EMPLEADO", "ESTADOS_EMPLEADO", "ESTADO_LABORAL", "ESTADOS_LABORALES"]),
          subEstado: findTableId(tables, ["SUBESTADO", "SUBESTADOS", "SUB_ESTADO", "SUB_ESTADOS", "SUBESTADO_EMPLEADO", "SUBESTADOS_EMPLEADO", "SUBESTADO_LABORAL", "SUBESTADOS_LABORALES"]),
          tipoDocumento: findTableId(tables, ["TIPO_DOCUMENTO", "TIPO_DOCUMENTOS", "DOCUMENTO", "DOCUMENTOS"]),
          sexo: findTableId(tables, ["SEXO", "SEXOS"]),
          nivelEstudios: findTableId(tables, ["NIVEL_ESTUDIOS", "NIVEL_ESTUDIO"]),
          estadoCivil: findTableId(tables, ["ESTADO_CIVIL", "ESTADOS_CIVILES"]),
          origen: findTableId(tables, ["ORIGEN", "ORIGENES"]),
          campania: findTableId(tables, ["CAMPANIA", "CAMPANIAS"]),
          producto: findTableId(tables, ["PRODUCTO", "PRODUCTOS", "TIPO_PRODUCTO", "TIPO_PRODUCTOS"]),
          generacion: findTableId(tables, ["GENERACION", "GENERACIONES"]),
          jornada: findTableId(tables, ["JORNADA", "JORNADAS"]),
          turno: findTableId(tables, ["TURNO", "TURNOS"]),
          tipoContrato: findTableId(tables, ["TIPO_CONTRATO", "TIPO_CONTRATOS"]),
          banco: findTableId(tables, ["BANCO", "BANCOS"]),
          empresa: findTableId(tables, ["EMPRESA", "EMPRESAS"]),
          parentesco: findTableId(tables, ["PARENTESCO", "PARENTESCOS"]),
        };
        const [
          tipoDocumentoItems, sexoItems, areaItems, cargoItems, estadoItems, subEstadoItems, estadoCivilItems, nivelEstudiosItems,
          origenItems, campaniaItems, productoItems, generacionItems, jornadaItems, turnoItems, tipoContratoItems, bancoItems,
          empresaItems, parentescoItems, employeeList,
        ] = await Promise.all([
          tableIds.tipoDocumento ? itemsMaestrosService.getAll(tableIds.tipoDocumento, undefined, true) : Promise.resolve([]),
          tableIds.sexo ? itemsMaestrosService.getAll(tableIds.sexo, undefined, true) : Promise.resolve([]),
          tableIds.area ? itemsMaestrosService.getAll(tableIds.area, undefined, true) : Promise.resolve([]),
          tableIds.cargo ? itemsMaestrosService.getAll(tableIds.cargo, undefined, true) : Promise.resolve([]),
          tableIds.estado ? itemsMaestrosService.getAll(tableIds.estado, undefined, true) : Promise.resolve([]),
          tableIds.subEstado ? itemsMaestrosService.getAll(tableIds.subEstado, undefined, true) : Promise.resolve([]),
          tableIds.estadoCivil ? itemsMaestrosService.getAll(tableIds.estadoCivil, undefined, true) : Promise.resolve([]),
          tableIds.nivelEstudios ? itemsMaestrosService.getAll(tableIds.nivelEstudios, undefined, true) : Promise.resolve([]),
          tableIds.origen ? itemsMaestrosService.getAll(tableIds.origen, undefined, true) : Promise.resolve([]),
          tableIds.campania ? itemsMaestrosService.getAll(tableIds.campania, undefined, true) : Promise.resolve([]),
          tableIds.producto ? itemsMaestrosService.getAll(tableIds.producto, undefined, true) : Promise.resolve([]),
          tableIds.generacion ? itemsMaestrosService.getAll(tableIds.generacion, undefined, true) : Promise.resolve([]),
          tableIds.jornada ? itemsMaestrosService.getAll(tableIds.jornada, undefined, true) : Promise.resolve([]),
          tableIds.turno ? itemsMaestrosService.getAll(tableIds.turno, undefined, true) : Promise.resolve([]),
          tableIds.tipoContrato ? itemsMaestrosService.getAll(tableIds.tipoContrato, undefined, true) : Promise.resolve([]),
          tableIds.banco ? itemsMaestrosService.getAll(tableIds.banco, undefined, true) : Promise.resolve([]),
          tableIds.empresa ? itemsMaestrosService.getAll(tableIds.empresa, undefined, true) : Promise.resolve([]),
          tableIds.parentesco ? itemsMaestrosService.getAll(tableIds.parentesco, undefined, true) : Promise.resolve([]),
          empleadosService.list({ pagina: 1, tamanio: 5000, soloActivos: true }),
        ]);
        if (!active) return;
        setMasters({
          tipoDocumentoItems, sexoItems, areaItems, cargoItems, estadoItems, subEstadoItems, estadoCivilItems, nivelEstudiosItems,
          origenItems, campaniaItems, productoItems, generacionItems, jornadaItems, turnoItems, tipoContratoItems, bancoItems,
          empresaItems, parentescoItems,
        });
        setEmployeeOptions(employeeList.items);
      } catch (error) {
        if (active) setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudieron cargar los catalogos de personal.", variant: "error" });
      }
    };
    void loadMasters();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { void loadEmployees(); }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [search, onlyActive, estadoId, areaId, cargoId, page, pageSize]);

  useEffect(() => {
  if (!employeeModalOpen || employeeModalMode !== "create") return undefined;

    const tipoDocumentoId = form.tipoDocumentoId ? Number(form.tipoDocumentoId) : null;
    const numeroDocumento = form.numeroDocumento.trim();

    if (!tipoDocumentoId) {
      setDocumentGate("idle");
      setDocumentGateMessage("Seleccione tipo de documento para habilitar el número de documento.");
      return undefined;
    }

    if (!numeroDocumento) {
      setDocumentGate("idle");
      setDocumentGateMessage(
        documentMeta.expectedLength
          ? `Ingrese ${documentMeta.expectedLength} dígitos para ${documentMeta.label}.`
          : "Ingrese el número de documento."
      );
      return undefined;
    }

    if (documentMeta.expectedLength && numeroDocumento.length < documentMeta.expectedLength) {
      setDocumentGate("idle");
      setDocumentGateMessage(`El ${documentMeta.label} debe tener ${documentMeta.expectedLength} dígitos.`);
      return undefined;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      try {
        // Solo búsqueda automática para DNI
        if (documentMeta.kind !== "DNI") {
          if (documentMeta.kind === "CE") {
            setDocumentGate("ready");
            setDocumentGateMessage("Carnet de Extranjería válido. Complete la ficha manualmente.");
            return;
          }

          setDocumentGate("ready");
          setDocumentGateMessage("Documento válido. Puede continuar con la ficha.");
          return;
        }

        setDocumentGate("checking");
        setDocumentGateMessage("Validando DNI en registros internos...");

        const existing = await empleadosService.searchByDocument(numeroDocumento, tipoDocumentoId);

        if (cancelled) return;

        if (existing) {
          setDocumentGate("existing");
          setDocumentGateMessage(
            `El documento ya existe para ${fullName({
              apellidoPaterno: existing.apellidoPaterno,
              apellidoMaterno: existing.apellidoMaterno,
              primerNombre: existing.primerNombre,
              segundoNombre: existing.segundoNombre,
            })}. Búsquelo en los registros de personal para editarlo.`
          );
          return;
        }

        setDocumentGateMessage("DNI no encontrado internamente. Consultando RENIEC...");

        const reniec = await empleadosService.consultarDni(numeroDocumento);

        if (cancelled) return;

        if (!reniec) {
          setDocumentGate("invalid");
          setDocumentGateMessage("El DNI no fue encontrado en RENIEC.");
          return;
        }

        const names = splitPeruApiNames(reniec.nombres);

        setForm((current) => ({
          ...current,
          apellidoPaterno: reniec.apellidoPaterno?.trim() || current.apellidoPaterno,
          apellidoMaterno: reniec.apellidoMaterno?.trim() || current.apellidoMaterno,
          primerNombre: names.primerNombre || current.primerNombre,
          segundoNombre: names.segundoNombre || current.segundoNombre,
          nacionalidad: current.nacionalidad?.trim() || "PERUANA",
        }));

        setDocumentGate("ready");
        setDocumentGateMessage("DNI validado correctamente en la RENIEC.");
      } catch (error) {
        if (cancelled) return;

        setDocumentGate("invalid");
        setDocumentGateMessage(error instanceof Error ? error.message : "No se pudo validar el documento.");
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    employeeModalMode,
    employeeModalOpen,
    form.numeroDocumento,
    form.tipoDocumentoId,
    documentMeta,
  ]);

  const areaOptions = useMemo(() => buildOptions(masters.areaItems, "Todas las areas"), [masters.areaItems]);
  const cargoOptions = useMemo(() => buildOptions(masters.cargoItems, "Todos los cargos"), [masters.cargoItems]);
  const estadoOptions = useMemo(() => buildOptions(masters.estadoItems, "Todos los estados"), [masters.estadoItems]);
  const subEstadoOptions = useMemo(() => buildOptions(masters.subEstadoItems, "Seleccione un subestado"), [masters.subEstadoItems]);
  const tipoDocumentoOptions = useMemo(() => buildOptions(masters.tipoDocumentoItems, "Seleccione un tipo"), [masters.tipoDocumentoItems]);
  const sexoOptions = useMemo(() => buildOptions(masters.sexoItems, "Seleccione un sexo"), [masters.sexoItems]);
  const nivelEstudiosOptions = useMemo(() => buildOptions(masters.nivelEstudiosItems, "Seleccione un nivel"), [masters.nivelEstudiosItems]);
  const estadoCivilOptions = useMemo(() => buildOptions(masters.estadoCivilItems, "Seleccione un estado civil"), [masters.estadoCivilItems]);
  const origenOptions = useMemo(() => buildOptions(masters.origenItems, "Seleccione un origen"), [masters.origenItems]);
  const campaniaOptions = useMemo(() => buildOptions(masters.campaniaItems, "Seleccione una campania"), [masters.campaniaItems]);
  const productoOptions = useMemo(() => buildOptions(masters.productoItems, "Seleccione un producto"), [masters.productoItems]);
  const generacionOptions = useMemo(() => buildOptions(masters.generacionItems, "Seleccione una generacion"), [masters.generacionItems]);
  const jornadaOptions = useMemo(() => buildOptions(masters.jornadaItems, "Seleccione una jornada"), [masters.jornadaItems]);
  const turnoOptions = useMemo(() => buildOptions(masters.turnoItems, "Seleccione un turno"), [masters.turnoItems]);
  const tipoContratoOptions = useMemo(() => buildOptions(masters.tipoContratoItems, "Seleccione un tipo de contrato"), [masters.tipoContratoItems]);
  const bancoOptions = useMemo(() => buildOptions(masters.bancoItems, "Seleccione un banco"), [masters.bancoItems]);
  const empresaOptions = useMemo(() => buildOptions(masters.empresaItems, "Seleccione una empresa"), [masters.empresaItems]);
  const parentescoOptions = useMemo(() => buildOptions(masters.parentescoItems, "Seleccione un parentesco"), [masters.parentescoItems]);
  const jefeOptions = useMemo<SelectOption[]>(() => [{ label: "Seleccione un jefe", value: "" }, ...employeeOptions.map((item) => ({ label: fullName(item), value: String(item.empleadoId) }))], [employeeOptions]);
  const hijosOptions = useMemo<SelectOption[]>(() => [{ label: "Seleccione", value: "" }, { label: "Si", value: "true" }, { label: "No", value: "false" }], []);
  const visibleActiveCount = useMemo(() => employees.filter((item) => item.activo).length, [employees]);
  const visibleWithUserCount = useMemo(() => employees.filter((item) => item.usuarioId && item.usuarioActivo).length, [employees]);
  const formFieldsDisabled = employeeModalMode === "create" && documentGate !== "ready";
  const employeeHeaderName = useMemo(
    () => [form.apellidoPaterno, form.apellidoMaterno, form.primerNombre, form.segundoNombre].filter((item) => item?.trim()).join(" ") || "Nombre pendiente",
    [form.apellidoMaterno, form.apellidoPaterno, form.primerNombre, form.segundoNombre],
  );
  const employeeHeaderArea = useMemo(
    () => masters.areaItems.find((item) => String(item.itemMaestroId) === form.areaId)?.nombre || "Area pendiente",
    [form.areaId, masters.areaItems],
  );
  const employeeHeaderCargo = useMemo(
    () => masters.cargoItems.find((item) => String(item.itemMaestroId) === form.cargoId)?.nombre || "Cargo pendiente",
    [form.cargoId, masters.cargoItems],
  );
  const employeeHeaderCampaigns = useMemo(
    () => (form.campanias.length > 0
      ? masters.campaniaItems
        .filter((item) => form.campanias.includes(String(item.itemMaestroId)))
        .map((item) => item.nombre)
        .join(", ")
      : "Sin campanias"),
    [form.campanias, masters.campaniaItems],
  );

  const handleClearFilters = async (): Promise<void> => {
    if (!(await ensureActionPermission(ACTION_CODES.clear, "limpiar"))) return;
    setSearch(""); setOnlyActive(true); setAreaId(""); setCargoId(""); setEstadoId(""); setPage(1);
  };
  const openCreateModal = async (): Promise<void> => {
    if (!(await ensureActionPermission(ACTION_CODES.create, "crear"))) return;
    setEmployeeModalMode("create");
    setForm(EMPTY_FORM);
    setFormErrors({});
    setDocumentGate("idle");
    setDocumentGateMessage("Seleccione tipo de documento e ingrese el numero para habilitar la ficha.");
    setEmployeeModalOpen(true);
  };
  const openEditModal = async (employee: EmpleadoListItem): Promise<void> => {
    if (!(await ensureActionPermission(ACTION_CODES.edit, "editar"))) return;
    setEmployeeModalMode("edit");
    setFormErrors({});
    setDocumentGate("ready");
    setDocumentGateMessage("Edicion de ficha existente.");
    setEmployeeModalOpen(true);
    setLoadingEmployee(true);
    try { setForm(mapDetailToForm(await empleadosService.getById(employee.empleadoId))); }
    catch (error) {
      setEmployeeModalOpen(false);
      setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudo cargar el detalle del empleado.", variant: "error" });
    } finally { setLoadingEmployee(false); }
  };
  const handleSave = async (): Promise<void> => {
    if (!(await ensureActionPermission(ACTION_CODES.save, "guardar"))) return;
    if (employeeModalMode === "create" && documentGate !== "ready") {
      setFeedback({ title: "Documento pendiente", message: documentGateMessage, variant: documentGate === "existing" || documentGate === "invalid" ? "warning" : "info" });
      return;
    }
    const missingFields = REQUIRED_FIELDS.filter((field) => isFieldEmpty(form[field as FormField]));
    if (missingFields.length > 0) {
      setFormErrors(buildFormErrors(missingFields) as Partial<Record<FormField, string>>);
      setFeedback({
        title: "Datos incompletos",
        message: buildMissingFieldsMessage(missingFields),
        variant: "warning",
      });
      return;
    }
    setFormErrors({});
    setSavingEmployee(true);
    try {
      await empleadosService.save(buildSavePayload(form));
      setEmployeeModalOpen(false);
      setFeedback({ title: "Proceso completado", message: employeeModalMode === "create" ? "Personal creado correctamente." : "Personal actualizado correctamente.", variant: "info" });
      await loadEmployees();
    } catch (error) {
      setFeedback({ title: "No se pudo guardar", message: error instanceof Error ? error.message : "No se pudo guardar el personal.", variant: "error" });
    } finally { setSavingEmployee(false); }
  };
  const handleDeactivate = async (): Promise<void> => {
    if (!confirmDeactivate) return;
    if (!(await ensureActionPermission(ACTION_CODES.delete, "inactivar"))) return;
    setProcessingDeactivate(true);
    try {
      await empleadosService.deactivate(confirmDeactivate.empleadoId);
      setConfirmDeactivate(null);
      setFeedback({ title: "Proceso completado", message: "Personal inactivado correctamente.", variant: "info" });
      await loadEmployees();
    } catch (error) {
      setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudo inactivar el personal.", variant: "error" });
    } finally { setProcessingDeactivate(false); }
  };
  const handleExport = async (): Promise<void> => {
    if (!(await ensureActionPermission(ACTION_CODES.export, "exportar"))) return;
    try {
      const response = await empleadosService.list({
        pagina: 1, tamanio: 5000, texto: search.trim() || undefined, soloActivos: onlyActive,
        estadoId: estadoId ? Number(estadoId) : undefined, areaId: areaId ? Number(areaId) : undefined, cargoId: cargoId ? Number(cargoId) : undefined,
      });
      downloadCsv("personal.csv", [["Documento", "Nombre", "Area", "Cargo", "Estado laboral", "Acceso", "Ingreso"], ...response.items.map((item) => [
        item.numeroDocumento ?? "-", fullName(item), item.areaNombre ?? "-", item.cargoNombre ?? "-", item.activo ? "Activo" : "Inactivo",
        item.usuarioActivo ? "Acceso activo" : "Sin acceso", item.fechaCreacion ? formatDate(item.fechaCreacion) : "-",
      ])]);
    } catch (error) {
      setFeedback({ title: "No se pudo exportar", message: error instanceof Error ? error.message : "No se pudo exportar el personal.", variant: "error" });
    }
  };
  const handleTipoDocumentoChange = (value: string): void => {
  const selected = masters.tipoDocumentoItems.find((item) => String(item.itemMaestroId) === value);
  const meta = getDocumentMeta(selected);

    setForm((current) => ({
      ...current,
      tipoDocumentoId: value,
      numeroDocumento: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      primerNombre: "",
      segundoNombre: "",
      nacionalidad: "",
    }));

    setFormErrors((current) => {
      const next = { ...current };
      delete next.tipoDocumentoId;
      delete next.numeroDocumento;
      return next;
    });

    if (!value) {
      setDocumentGate("idle");
      setDocumentGateMessage("Seleccione tipo de documento para habilitar el número de documento.");
      return;
    }

    if (meta.expectedLength) {
      setDocumentGate("idle");
      setDocumentGateMessage(`Ingrese ${meta.expectedLength} dígitos para ${meta.label}.`);
      return;
    }

    setDocumentGate("idle");
    setDocumentGateMessage("Ingrese el número de documento.");
  };

  const handleNumeroDocumentoChange = (value: string): void => {
    const onlyDigits = value.replace(/\D/g, "");
    const maxLength = documentMeta.expectedLength ?? 20;
    const sanitized = onlyDigits.slice(0, maxLength);

    setField("numeroDocumento", sanitized);
  };
  const columns = useMemo<Array<TableColumn<EmpleadoListItem>>>(() => [
    {
      key: "nombre",
      header: "Personal",
      className: "text-left",
      render: (row) => <div className="space-y-1 text-left"><p className="text-sm font-semibold text-slate-900">{fullName(row)}</p><p className="text-xs text-slate-500">{row.numeroDocumento || "-"}</p><p className="text-xs text-slate-400">{row.usuarioLogin || "Sin usuario"}</p></div>,
    },
    { key: "area", header: "Area", className: "text-left", render: (row) => <span className="text-sm text-slate-700">{row.areaNombre || "-"}</span> },
    { key: "cargo", header: "Cargo", className: "text-left", render: (row) => <span className="text-sm text-slate-700">{row.cargoNombre || "-"}</span> },
    {
      key: "estado",
      header: "Estado",
      render: (row) => <div className="flex flex-col items-center gap-2"><Badge variant={row.activo ? "success" : "danger"}>{row.activo ? "Activo" : "Inactivo"}</Badge><Badge variant={row.usuarioActivo ? "info" : "neutral"}>{row.usuarioActivo ? "Acceso activo" : "Sin acceso"}</Badge></div>,
    },
    { key: "fechaCreacion", header: "Ingreso", render: (row) => <span className="text-sm text-slate-700">{formatDate(row.fechaCreacion)}</span> },
    {
      key: "acciones",
      header: "Acciones",
      render: (row) => <div className="flex flex-wrap items-center justify-center gap-2"><Button leftIcon={<Pencil size={14} />} onClick={() => void openEditModal(row)} size="sm" variant="edit">Editar</Button>{row.activo ? <Button leftIcon={<UserX size={14} />} onClick={() => setConfirmDeactivate(row)} size="sm" variant="delete">Inactivar</Button> : <Badge variant="neutral">Inactivo</Badge>}</div>,
    },
  ], []);

  type DocumentKind = "DNI" | "CE" | "OTRO";

  type DocumentMeta = {
    kind: DocumentKind;
    label: string;
    expectedLength: number | null;
    enableLookup: boolean;
  };

  const getDocumentMeta = (item?: AppItemMaestro | null): DocumentMeta => {
    const codigo = normalizeCode(item?.codigo);
    const nombre = normalizeCode(item?.nombre);
    const text = `${codigo} ${nombre}`;

    if (text.includes("DNI")) {
      return {
        kind: "DNI",
        label: "DNI",
        expectedLength: 8,
        enableLookup: true,
      };
    }

    if (
      text.includes("CARNET") ||
      text.includes("EXTRANJERIA") ||
      codigo === "CE"
    ) {
      return {
        kind: "CE",
        label: "Carnet de Extranjería",
        expectedLength: 9,
        enableLookup: false,
      };
    }

    return {
      kind: "OTRO",
      label: item?.nombre ?? "documento",
      expectedLength: null,
      enableLookup: false,
    };
  };

  const splitPeruApiNames = (value?: string | null): { primerNombre: string; segundoNombre: string } => {
    const tokens = (value ?? "").trim().split(/\s+/).filter(Boolean);

    if (tokens.length === 0) {
      return { primerNombre: "", segundoNombre: "" };
    }

    if (tokens.length === 1) {
      return { primerNombre: tokens[0], segundoNombre: "" };
    }

    return {
      primerNombre: tokens[0],
      segundoNombre: tokens.slice(1).join(" "),
    };
  };

  return (
    <div className="space-y-5">
      <Card subtitle="Administre el personal del sistema con filtros, creacion y edicion desde una sola vista." title="Personal">
        <div className="flex flex-wrap items-end gap-3">
          <Input containerClassName="min-w-[220px] flex-1" label="Buscar" onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Documento, nombre o usuario" value={search} />
          <Select containerClassName="min-w-[180px] flex-1" label="Estado" onChange={(event) => { setOnlyActive(event.target.value !== "all"); setPage(1); }} options={[{ label: "Solo activos", value: "active" }, { label: "Todos", value: "all" }]} value={onlyActive ? "active" : "all"} />
          <Select containerClassName="min-w-[180px] flex-1" label="Area" onChange={(event) => { setAreaId(event.target.value); setPage(1); }} options={areaOptions} value={areaId} />
          <Select containerClassName="min-w-[180px] flex-1" label="Cargo" onChange={(event) => { setCargoId(event.target.value); setPage(1); }} options={cargoOptions} value={cargoId} />
          <Select containerClassName="min-w-[180px] flex-1" label="Estado laboral" onChange={(event) => { setEstadoId(event.target.value); setPage(1); }} options={estadoOptions} value={estadoId} />
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => void handleClearFilters()} variant="clear">Limpiar</Button>
            <Button leftIcon={<FileSpreadsheet size={14} />} onClick={() => void handleExport()} variant="export">Exportar</Button>
            <Button leftIcon={<Plus size={14} />} onClick={() => void openCreateModal()} variant="create">Nuevo personal</Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Registros filtrados</p><p className="mt-2 text-3xl font-semibold text-slate-900">{total}</p><p className="mt-1 text-sm text-slate-500">Total del resultado actual.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Activos en pagina</p><p className="mt-2 text-3xl font-semibold text-emerald-600">{visibleActiveCount}</p><p className="mt-1 text-sm text-slate-500">Personal laboralmente vigente en la pagina mostrada.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Con acceso tecnico</p><p className="mt-2 text-3xl font-semibold text-sky-600">{visibleWithUserCount}</p><p className="mt-1 text-sm text-slate-500">Usuarios con acceso activo dentro del resultado visible.</p></div>
      </section>

      <Card subtitle={loading ? "Cargando informacion del personal..." : `${total} registros encontrados.`} title="Listado de personal">
        <div className="space-y-4">
          <Table columns={columns} emptyMessage={loading ? "Cargando personal..." : "No hay personal para mostrar."} getRowKey={(row) => String(row.empleadoId)} rows={employees} />
          <Pagination onPageChange={setPage} onPageSizeChange={(value) => { setPageSize(value); setPage(1); }} page={page} pageSize={pageSize} total={total} />
        </div>
      </Card>

      <Modal bodyClassName="max-h-[calc(88vh-190px)] overflow-hidden" footer={<Button loading={savingEmployee} onClick={() => void handleSave()} variant="create">Guardar personal</Button>} isOpen={employeeModalOpen} onClose={() => { setEmployeeModalOpen(false); setForm(EMPTY_FORM); setFormErrors({}); }} panelClassName="max-h-[88vh] max-w-[1120px] overflow-hidden" title={employeeModalMode === "create" ? "Nuevo personal" : "Editar personal"} variant="info">
        {loadingEmployee ? <p>Cargando informacion del personal...</p> : (
          <div className="space-y-5">
            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 lg:grid-cols-[1.5fr_1fr_1fr_1.15fr]">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Nombre completo</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{employeeHeaderName}</p>
                <p className="mt-1 text-sm text-slate-500">Usuario</p>
                <p className="text-sm font-medium text-slate-700">{form.numeroDocumento || "Pendiente"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Area</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{employeeHeaderArea}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Cargo</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{employeeHeaderCargo}</p>
              </div>
              <div className={formErrors.campanias ? "rounded-xl border border-red-300 bg-red-50/70 px-4 py-3" : "rounded-xl border border-slate-200 bg-white px-4 py-3"}>
                <p className={formErrors.campanias ? "text-[11px] font-semibold uppercase tracking-[0.08em] text-red-700" : "text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500"}>Campanias</p>
                <p className={formErrors.campanias ? "mt-2 text-sm font-semibold text-red-800" : "mt-2 text-sm font-semibold text-slate-900"}>{employeeHeaderCampaigns}</p>
              </div>
            </div>
            {employeeModalMode === "create" ? (
              <div className={
                documentGate === "existing" || documentGate === "invalid"
                  ? "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
                  : documentGate === "ready"
                    ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                    : "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600"
              }>
                {documentGateMessage}
              </div>
            ) : null}

            <div className="max-h-[calc(88vh-360px)] space-y-5 overflow-y-auto pr-2">
              <Section subtitle="Informacion principal del empleado y datos personales base." title="Datos personales">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Select errorText={errorFor("tipoDocumentoId", formErrors)} label="Tipo de documento" onChange={(event) => handleTipoDocumentoChange(event.target.value)} options={tipoDocumentoOptions} value={form.tipoDocumentoId} />
                  <Input disabled={numeroDocumentoDisabled} errorText={errorFor("numeroDocumento", formErrors)} label="Numero de documento" onChange={(event) => handleNumeroDocumentoChange(event.target.value)} placeholder={!form.tipoDocumentoId ? "Seleccione un tipo de documento" : documentMeta.expectedLength ? `Ingrese ${documentMeta.expectedLength} dígitos` : "Ingrese el número de documento"} value={form.numeroDocumento} />
                  <fieldset className="contents disabled:opacity-60" disabled={formFieldsDisabled}>
                  <Input errorText={errorFor("apellidoPaterno", formErrors)} label="Apellido paterno" onChange={(event) => setField("apellidoPaterno", event.target.value)} value={form.apellidoPaterno} />
                  <Input errorText={errorFor("apellidoMaterno", formErrors)} label="Apellido materno" onChange={(event) => setField("apellidoMaterno", event.target.value)} value={form.apellidoMaterno} />
                  <Input errorText={errorFor("primerNombre", formErrors)} label="Primer nombre" onChange={(event) => setField("primerNombre", event.target.value)} value={form.primerNombre} />
                  <Input label="Segundo nombre" onChange={(event) => setField("segundoNombre", event.target.value)} value={form.segundoNombre} />
                  <Input errorText={errorFor("fechaNacimiento", formErrors)} label="Fecha de nacimiento" onChange={(event) => setField("fechaNacimiento", event.target.value)} type="date" value={form.fechaNacimiento} />
                  <Input label="Edad" onChange={(event) => setField("edad", event.target.value)} value={form.edad} />
                  <Input errorText={errorFor("nacionalidad", formErrors)} label="Nacionalidad" onChange={(event) => setField("nacionalidad", event.target.value)} value={form.nacionalidad} />
                  <Select errorText={errorFor("sexoId", formErrors)} label="Sexo" onChange={(event) => setField("sexoId", event.target.value)} options={sexoOptions} value={form.sexoId} />
                  <Select label="Nivel de estudios" onChange={(event) => setField("nivelEstudiosId", event.target.value)} options={nivelEstudiosOptions} value={form.nivelEstudiosId} />
                  <Select label="Estado civil" onChange={(event) => setField("estadoCivilId", event.target.value)} options={estadoCivilOptions} value={form.estadoCivilId} />
                  <Select label="Tiene hijos" onChange={(event) => setField("hijos", event.target.value)} options={hijosOptions} value={form.hijos} />
                  <Input label="Cantidad de hijos" onChange={(event) => setField("cantidadHijos", event.target.value)} type="number" value={form.cantidadHijos} />
                  <Input errorText={errorFor("celular", formErrors)} label="Celular" onChange={(event) => setField("celular", event.target.value)} value={form.celular} />
                  <Input errorText={errorFor("correoPersonal", formErrors)} label="Correo personal" onChange={(event) => setField("correoPersonal", event.target.value)} type="email" value={form.correoPersonal} />
                  </fieldset>
                </div>
              </Section>

              <Section subtitle="Ubicacion, contacto y datos complementarios de direccion." title="Direccion">
                <fieldset className="contents disabled:opacity-60" disabled={formFieldsDisabled}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Input errorText={errorFor("departamento", formErrors)} label="Departamento" onChange={(event) => setField("departamento", event.target.value)} value={form.departamento} />
                  <Input errorText={errorFor("provincia", formErrors)} label="Provincia" onChange={(event) => setField("provincia", event.target.value)} value={form.provincia} />
                  <Input errorText={errorFor("distrito", formErrors)} label="Distrito" onChange={(event) => setField("distrito", event.target.value)} value={form.distrito} />
                  <Input label="Celular de emergencia" onChange={(event) => setField("celularEmergencia", event.target.value)} value={form.celularEmergencia} />
                  <Input containerClassName="md:col-span-2 xl:col-span-3" errorText={errorFor("direccion", formErrors)} label="Direccion" onChange={(event) => setField("direccion", event.target.value)} value={form.direccion} />
                  <Input errorText={errorFor("correoCorporativo", formErrors)} label="Correo corporativo" onChange={(event) => setField("correoCorporativo", event.target.value)} type="email" value={form.correoCorporativo} />
                </div>
                <Textarea label="Referencia de direccion" onChange={(event) => setField("referenciaDir", event.target.value)} rows={2} value={form.referenciaDir} />
                </fieldset>
              </Section>

              <Section subtitle="Registro familiar simple para el contacto principal vinculado al empleado." title="Familiar">
                <fieldset className="contents disabled:opacity-60" disabled={formFieldsDisabled}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Select errorText={errorFor("parentescoId", formErrors)} label="Parentesco" onChange={(event) => setField("parentescoId", event.target.value)} options={parentescoOptions} value={form.parentescoId} />
                  <Select errorText={errorFor("famTipoDocumentoId", formErrors)} label="Tipo documento familiar" onChange={(event) => setField("famTipoDocumentoId", event.target.value)} options={tipoDocumentoOptions} value={form.famTipoDocumentoId} />
                  <Input errorText={errorFor("famNumeroDocumento", formErrors)} label="Documento familiar" onChange={(event) => setField("famNumeroDocumento", event.target.value)} value={form.famNumeroDocumento} />
                  <Select errorText={errorFor("famSexoId", formErrors)} label="Sexo familiar" onChange={(event) => setField("famSexoId", event.target.value)} options={sexoOptions} value={form.famSexoId} />
                  <Input errorText={errorFor("famPrimerNombre", formErrors)} label="Primer nombre" onChange={(event) => setField("famPrimerNombre", event.target.value)} value={form.famPrimerNombre} />
                  <Input label="Segundo nombre" onChange={(event) => setField("famSegundoNombre", event.target.value)} value={form.famSegundoNombre} />
                  <Input errorText={errorFor("famApellidoPaterno", formErrors)} label="Apellido paterno" onChange={(event) => setField("famApellidoPaterno", event.target.value)} value={form.famApellidoPaterno} />
                  <Input label="Apellido materno" onChange={(event) => setField("famApellidoMaterno", event.target.value)} value={form.famApellidoMaterno} />
                  <Input errorText={errorFor("famCelular", formErrors)} label="Celular familiar" onChange={(event) => setField("famCelular", event.target.value)} value={form.famCelular} />
                </div>
                </fieldset>
              </Section>

              <Section subtitle="Origen de postulacion y relacion con area, cargo, producto y campania postulada." title="Postulacion">
                <fieldset className="contents disabled:opacity-60" disabled={formFieldsDisabled}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Select errorText={errorFor("origenId", formErrors)} label="Origen" onChange={(event) => setField("origenId", event.target.value)} options={origenOptions} value={form.origenId} />
                  <Select errorText={errorFor("areaPostId", formErrors)} label="Area postulada" onChange={(event) => setField("areaPostId", event.target.value)} options={buildOptions(masters.areaItems, "Seleccione un area")} value={form.areaPostId} />
                  <Select errorText={errorFor("cargoPostId", formErrors)} label="Cargo postulado" onChange={(event) => setField("cargoPostId", event.target.value)} options={buildOptions(masters.cargoItems, "Seleccione un cargo")} value={form.cargoPostId} />
                  <Select errorText={errorFor("productoPostId", formErrors)} label="Producto postulado" onChange={(event) => setField("productoPostId", event.target.value)} options={productoOptions} value={form.productoPostId} />
                  <Select errorText={errorFor("campaniaPostId", formErrors)} label="Campania postulada" onChange={(event) => setField("campaniaPostId", event.target.value)} options={campaniaOptions} value={form.campaniaPostId} />
                  <Input errorText={errorFor("fechaPostulacion", formErrors)} label="Fecha de postulacion" onChange={(event) => setField("fechaPostulacion", event.target.value)} type="date" value={form.fechaPostulacion} />
                  <Input containerClassName="md:col-span-2" label="Referencia de postulacion" onChange={(event) => setField("referenciaPost", event.target.value)} value={form.referenciaPost} />
                </div>
                </fieldset>
              </Section>

              <Section subtitle="Informacion contractual, area operativa actual y codigos internos." title="Contratacion">
                <fieldset className="contents disabled:opacity-60" disabled={formFieldsDisabled}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Select errorText={errorFor("jefeEmpleadoId", formErrors)} label="Jefe inmediato" onChange={(event) => setField("jefeEmpleadoId", event.target.value)} options={jefeOptions} value={form.jefeEmpleadoId} />
                  <Input label="Codigo ejecutivo" onChange={(event) => setField("codigoEjecutivo", event.target.value)} value={form.codigoEjecutivo} />
                  <Input label="Codigo dial" onChange={(event) => setField("codigoDial", event.target.value)} value={form.codigoDial} />
                  <Input label="Codigo propio" onChange={(event) => setField("codigoPropio", event.target.value)} value={form.codigoPropio} />
                  <Select label="Generacion" onChange={(event) => setField("generacionId", event.target.value)} options={generacionOptions} value={form.generacionId} />
                  <Select errorText={errorFor("jornadaId", formErrors)} label="Jornada" onChange={(event) => setField("jornadaId", event.target.value)} options={jornadaOptions} value={form.jornadaId} />
                  <Select errorText={errorFor("turnoId", formErrors)} label="Turno" onChange={(event) => setField("turnoId", event.target.value)} options={turnoOptions} value={form.turnoId} />
                  <Select errorText={errorFor("tipoContratoId", formErrors)} label="Tipo de contrato" onChange={(event) => setField("tipoContratoId", event.target.value)} options={tipoContratoOptions} value={form.tipoContratoId} />
                  <Select errorText={errorFor("areaId", formErrors)} label="Area actual" onChange={(event) => setField("areaId", event.target.value)} options={buildOptions(masters.areaItems, "Seleccione un area")} value={form.areaId} />
                  <Select errorText={errorFor("cargoId", formErrors)} label="Cargo actual" onChange={(event) => setField("cargoId", event.target.value)} options={buildOptions(masters.cargoItems, "Seleccione un cargo")} value={form.cargoId} />
                  <Select errorText={errorFor("tipoProductoId", formErrors)} label="Tipo de producto" onChange={(event) => setField("tipoProductoId", event.target.value)} options={productoOptions} value={form.tipoProductoId} />
                  <Input errorText={errorFor("fechaIngreso", formErrors)} label="Fecha de ingreso" onChange={(event) => setField("fechaIngreso", event.target.value)} type="date" value={form.fechaIngreso} />
                  <Select errorText={errorFor("bancoId", formErrors)} label="Banco" onChange={(event) => setField("bancoId", event.target.value)} options={bancoOptions} value={form.bancoId} />
                  <Input errorText={errorFor("numeroCuenta", formErrors)} label="Numero de cuenta" onChange={(event) => setField("numeroCuenta", event.target.value)} value={form.numeroCuenta} />
                  <Input errorText={errorFor("fechaInicioContrato", formErrors)} label="Fecha inicio contrato" onChange={(event) => setField("fechaInicioContrato", event.target.value)} type="date" value={form.fechaInicioContrato} />
                  <Input label="Fecha fin contrato" onChange={(event) => setField("fechaFinContrato", event.target.value)} type="date" value={form.fechaFinContrato} />
                  <Select errorText={errorFor("empresaId", formErrors)} label="Empresa" onChange={(event) => setField("empresaId", event.target.value)} options={empresaOptions} value={form.empresaId} />
                  <Input errorText={errorFor("sueldo", formErrors)} label="Sueldo" onChange={(event) => setField("sueldo", event.target.value)} type="number" value={form.sueldo} />
                  <Input label="Fecha de cambio" onChange={(event) => setField("fechaCambio", event.target.value)} type="date" value={form.fechaCambio} />
                  <Input label="Fecha de cese" onChange={(event) => setField("fechaCese", event.target.value)} type="date" value={form.fechaCese} />
                </div>
                </fieldset>
              </Section>

              <Section subtitle="Seleccion multiple de campanias activas del empleado." title="Campanias">
                <fieldset className="contents disabled:opacity-60" disabled={formFieldsDisabled}>
                {formErrors.campanias ? <p className="text-xs font-medium text-red-600">Debes seleccionar al menos una campania.</p> : null}
                {masters.campaniaItems.length === 0 ? <p className="text-sm text-slate-500">No se encontraron campanias en tablas maestras.</p> : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {masters.campaniaItems.map((item) => {
                      const checked = form.campanias.includes(String(item.itemMaestroId));
                      return <label className={formErrors.campanias ? "flex items-center gap-3 rounded-xl border border-red-300 bg-red-50/60 px-3 py-3 text-sm text-slate-700" : "flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700"} key={item.itemMaestroId}><input checked={checked} className="h-4 w-4 rounded border-slate-300" onChange={() => setField("campanias", checked ? form.campanias.filter((value) => value !== String(item.itemMaestroId)) : [...form.campanias, String(item.itemMaestroId)])} type="checkbox" /><span>{item.nombre}</span></label>;
                    })}
                  </div>
                )}
                </fieldset>
              </Section>

              <Section subtitle="Estado operativo del empleado, comentarios y subestado actual." title="Registro">
                <fieldset className="contents disabled:opacity-60" disabled={formFieldsDisabled}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Select errorText={errorFor("estadoId", formErrors)} label="Estado" onChange={(event) => setField("estadoId", event.target.value)} options={buildOptions(masters.estadoItems, "Seleccione un estado")} value={form.estadoId} />
                  <Select errorText={errorFor("subEstadoId", formErrors)} label="Subestado" onChange={(event) => setField("subEstadoId", event.target.value)} options={subEstadoOptions} value={form.subEstadoId} />
                </div>
                <Textarea label="Comentario" onChange={(event) => setField("comentario", event.target.value)} rows={3} value={form.comentario} />
                </fieldset>
              </Section>
            </div>
          </div>
        )}
      </Modal>

      <Modal footer={<Button loading={processingDeactivate} onClick={() => void handleDeactivate()} variant="delete">Confirmar</Button>} isOpen={Boolean(confirmDeactivate)} onClose={() => setConfirmDeactivate(null)} panelClassName="max-w-[560px]" title="Inactivar personal" variant="warning">
        <p>{confirmDeactivate ? `Se inactivara a ${fullName(confirmDeactivate)} y se cortara su acceso tecnico si tiene usuario asociado.` : ""}</p>
      </Modal>

      <Modal footer={<Button onClick={() => setFeedback(null)} variant="create">Cerrar</Button>} isOpen={Boolean(feedback)} onClose={() => setFeedback(null)} panelClassName="max-w-[560px]" title={feedback?.title || "Mensaje"} variant={feedback?.variant || "info"}>
        <p>{feedback?.message}</p>
      </Modal>
    </div>
  );
}

export default PersonalPage;
