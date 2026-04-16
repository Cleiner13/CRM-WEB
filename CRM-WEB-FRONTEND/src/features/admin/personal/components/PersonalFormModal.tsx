import { useMemo } from "react";
import { Button, Input, Modal, Select, Textarea } from "@/components/ui";
import type { SelectOption } from "@/components/ui";
import type { EmpleadoListItem } from "@/types";
import { PersonalSection as Section } from "./PersonalSection";
import type { DocumentGate, DocumentMeta, FormField, MasterCollections, PersonalFormState } from "../types/personalTypes";
import { buildOptions, errorFor, fullName } from "../utils/personalUtils";

type PersonalFormModalProps = {
  documentGate: DocumentGate;
  documentGateMessage: string;
  documentMeta: DocumentMeta;
  employeeOptions: EmpleadoListItem[];
  form: PersonalFormState;
  formErrors: Partial<Record<FormField, string>>;
  formFieldsDisabled: boolean;
  isOpen: boolean;
  loading: boolean;
  masters: MasterCollections;
  mode: "create" | "edit";
  numeroDocumentoDisabled: boolean;
  onClose: () => void;
  onFieldChange: <K extends keyof PersonalFormState>(field: K, value: PersonalFormState[K]) => void;
  onNumeroDocumentoChange: (value: string) => void;
  onSave: () => void;
  onTipoDocumentoChange: (value: string) => void;
  saving: boolean;
};

export function PersonalFormModal({
  documentGate,
  documentGateMessage,
  documentMeta,
  employeeOptions,
  form,
  formErrors,
  formFieldsDisabled,
  isOpen,
  loading,
  masters,
  mode,
  numeroDocumentoDisabled,
  onClose,
  onFieldChange,
  onNumeroDocumentoChange,
  onSave,
  onTipoDocumentoChange,
  saving,
}: PersonalFormModalProps): JSX.Element {
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
  const subEstadoOptions = useMemo(() => buildOptions(masters.subEstadoItems, "Seleccione un subestado"), [masters.subEstadoItems]);
  const jefeOptions = useMemo<SelectOption[]>(
    () => [{ label: "Seleccione un jefe", value: "" }, ...employeeOptions.map((item) => ({ label: fullName(item), value: String(item.empleadoId) }))],
    [employeeOptions],
  );
  const hijosOptions = useMemo<SelectOption[]>(() => [{ label: "Seleccione", value: "" }, { label: "Si", value: "true" }, { label: "No", value: "false" }], []);

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

  return (
    <Modal
      bodyClassName="max-h-[calc(88vh-190px)] overflow-hidden"
      footer={<Button loading={saving} onClick={onSave} variant="create">Guardar personal</Button>}
      isOpen={isOpen}
      onClose={onClose}
      panelClassName="max-h-[88vh] max-w-[1120px] overflow-hidden"
      title={mode === "create" ? "Nuevo personal" : "Editar personal"}
      variant="info"
    >
      {loading ? <p>Cargando informacion del personal...</p> : (
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

          {mode === "create" ? (
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
                <Select errorText={errorFor("tipoDocumentoId", formErrors)} label="Tipo de documento" onChange={(event) => onTipoDocumentoChange(event.target.value)} options={tipoDocumentoOptions} value={form.tipoDocumentoId} />
                <Input disabled={numeroDocumentoDisabled} errorText={errorFor("numeroDocumento", formErrors)} label="Numero de documento" onChange={(event) => onNumeroDocumentoChange(event.target.value)} placeholder={!form.tipoDocumentoId ? "Seleccione un tipo de documento" : documentMeta.expectedLength ? `Ingrese ${documentMeta.expectedLength} digitos` : "Ingrese el numero de documento"} value={form.numeroDocumento} />
                <fieldset className="contents disabled:opacity-60" disabled={formFieldsDisabled}>
                  <Input errorText={errorFor("apellidoPaterno", formErrors)} label="Apellido paterno" onChange={(event) => onFieldChange("apellidoPaterno", event.target.value)} value={form.apellidoPaterno} />
                  <Input errorText={errorFor("apellidoMaterno", formErrors)} label="Apellido materno" onChange={(event) => onFieldChange("apellidoMaterno", event.target.value)} value={form.apellidoMaterno} />
                  <Input errorText={errorFor("primerNombre", formErrors)} label="Primer nombre" onChange={(event) => onFieldChange("primerNombre", event.target.value)} value={form.primerNombre} />
                  <Input label="Segundo nombre" onChange={(event) => onFieldChange("segundoNombre", event.target.value)} value={form.segundoNombre} />
                  <Input errorText={errorFor("fechaNacimiento", formErrors)} label="Fecha de nacimiento" onChange={(event) => onFieldChange("fechaNacimiento", event.target.value)} type="date" value={form.fechaNacimiento} />
                  <Input label="Edad" onChange={(event) => onFieldChange("edad", event.target.value)} value={form.edad} />
                  <Input errorText={errorFor("nacionalidad", formErrors)} label="Nacionalidad" onChange={(event) => onFieldChange("nacionalidad", event.target.value)} value={form.nacionalidad} />
                  <Select errorText={errorFor("sexoId", formErrors)} label="Sexo" onChange={(event) => onFieldChange("sexoId", event.target.value)} options={sexoOptions} value={form.sexoId} />
                  <Select label="Nivel de estudios" onChange={(event) => onFieldChange("nivelEstudiosId", event.target.value)} options={nivelEstudiosOptions} value={form.nivelEstudiosId} />
                  <Select label="Estado civil" onChange={(event) => onFieldChange("estadoCivilId", event.target.value)} options={estadoCivilOptions} value={form.estadoCivilId} />
                  <Select label="Tiene hijos" onChange={(event) => onFieldChange("hijos", event.target.value)} options={hijosOptions} value={form.hijos} />
                  <Input label="Cantidad de hijos" onChange={(event) => onFieldChange("cantidadHijos", event.target.value)} type="number" value={form.cantidadHijos} />
                  <Input errorText={errorFor("celular", formErrors)} label="Celular" onChange={(event) => onFieldChange("celular", event.target.value)} value={form.celular} />
                  <Input errorText={errorFor("correoPersonal", formErrors)} label="Correo personal" onChange={(event) => onFieldChange("correoPersonal", event.target.value)} type="email" value={form.correoPersonal} />
                </fieldset>
              </div>
            </Section>

            <Section subtitle="Ubicacion, contacto y datos complementarios de direccion." title="Direccion">
              <fieldset className="contents disabled:opacity-60" disabled={formFieldsDisabled}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Input errorText={errorFor("departamento", formErrors)} label="Departamento" onChange={(event) => onFieldChange("departamento", event.target.value)} value={form.departamento} />
                  <Input errorText={errorFor("provincia", formErrors)} label="Provincia" onChange={(event) => onFieldChange("provincia", event.target.value)} value={form.provincia} />
                  <Input errorText={errorFor("distrito", formErrors)} label="Distrito" onChange={(event) => onFieldChange("distrito", event.target.value)} value={form.distrito} />
                  <Input label="Celular de emergencia" onChange={(event) => onFieldChange("celularEmergencia", event.target.value)} value={form.celularEmergencia} />
                  <Input containerClassName="md:col-span-2 xl:col-span-3" errorText={errorFor("direccion", formErrors)} label="Direccion" onChange={(event) => onFieldChange("direccion", event.target.value)} value={form.direccion} />
                  <Input errorText={errorFor("correoCorporativo", formErrors)} label="Correo corporativo" onChange={(event) => onFieldChange("correoCorporativo", event.target.value)} type="email" value={form.correoCorporativo} />
                </div>
                <Textarea label="Referencia de direccion" onChange={(event) => onFieldChange("referenciaDir", event.target.value)} rows={2} value={form.referenciaDir} />
              </fieldset>
            </Section>

            <Section subtitle="Registro familiar simple para el contacto principal vinculado al empleado." title="Familiar">
              <fieldset className="contents disabled:opacity-60" disabled={formFieldsDisabled}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Select errorText={errorFor("parentescoId", formErrors)} label="Parentesco" onChange={(event) => onFieldChange("parentescoId", event.target.value)} options={parentescoOptions} value={form.parentescoId} />
                  <Select errorText={errorFor("famTipoDocumentoId", formErrors)} label="Tipo documento familiar" onChange={(event) => onFieldChange("famTipoDocumentoId", event.target.value)} options={tipoDocumentoOptions} value={form.famTipoDocumentoId} />
                  <Input errorText={errorFor("famNumeroDocumento", formErrors)} label="Documento familiar" onChange={(event) => onFieldChange("famNumeroDocumento", event.target.value)} value={form.famNumeroDocumento} />
                  <Select errorText={errorFor("famSexoId", formErrors)} label="Sexo familiar" onChange={(event) => onFieldChange("famSexoId", event.target.value)} options={sexoOptions} value={form.famSexoId} />
                  <Input errorText={errorFor("famPrimerNombre", formErrors)} label="Primer nombre" onChange={(event) => onFieldChange("famPrimerNombre", event.target.value)} value={form.famPrimerNombre} />
                  <Input label="Segundo nombre" onChange={(event) => onFieldChange("famSegundoNombre", event.target.value)} value={form.famSegundoNombre} />
                  <Input errorText={errorFor("famApellidoPaterno", formErrors)} label="Apellido paterno" onChange={(event) => onFieldChange("famApellidoPaterno", event.target.value)} value={form.famApellidoPaterno} />
                  <Input label="Apellido materno" onChange={(event) => onFieldChange("famApellidoMaterno", event.target.value)} value={form.famApellidoMaterno} />
                  <Input errorText={errorFor("famCelular", formErrors)} label="Celular familiar" onChange={(event) => onFieldChange("famCelular", event.target.value)} value={form.famCelular} />
                </div>
              </fieldset>
            </Section>

            <Section subtitle="Origen de postulacion y relacion con area, cargo, producto y campania postulada." title="Postulacion">
              <fieldset className="contents disabled:opacity-60" disabled={formFieldsDisabled}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Select errorText={errorFor("origenId", formErrors)} label="Origen" onChange={(event) => onFieldChange("origenId", event.target.value)} options={origenOptions} value={form.origenId} />
                  <Select errorText={errorFor("areaPostId", formErrors)} label="Area postulada" onChange={(event) => onFieldChange("areaPostId", event.target.value)} options={buildOptions(masters.areaItems, "Seleccione un area")} value={form.areaPostId} />
                  <Select errorText={errorFor("cargoPostId", formErrors)} label="Cargo postulado" onChange={(event) => onFieldChange("cargoPostId", event.target.value)} options={buildOptions(masters.cargoItems, "Seleccione un cargo")} value={form.cargoPostId} />
                  <Select errorText={errorFor("productoPostId", formErrors)} label="Producto postulado" onChange={(event) => onFieldChange("productoPostId", event.target.value)} options={productoOptions} value={form.productoPostId} />
                  <Select errorText={errorFor("campaniaPostId", formErrors)} label="Campania postulada" onChange={(event) => onFieldChange("campaniaPostId", event.target.value)} options={campaniaOptions} value={form.campaniaPostId} />
                  <Input errorText={errorFor("fechaPostulacion", formErrors)} label="Fecha de postulacion" onChange={(event) => onFieldChange("fechaPostulacion", event.target.value)} type="date" value={form.fechaPostulacion} />
                  <Input containerClassName="md:col-span-2" label="Referencia de postulacion" onChange={(event) => onFieldChange("referenciaPost", event.target.value)} value={form.referenciaPost} />
                </div>
              </fieldset>
            </Section>

            <Section subtitle="Informacion contractual, area operativa actual y codigos internos." title="Contratacion">
              <fieldset className="contents disabled:opacity-60" disabled={formFieldsDisabled}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Select errorText={errorFor("jefeEmpleadoId", formErrors)} label="Jefe inmediato" onChange={(event) => onFieldChange("jefeEmpleadoId", event.target.value)} options={jefeOptions} value={form.jefeEmpleadoId} />
                  <Input label="Codigo ejecutivo" onChange={(event) => onFieldChange("codigoEjecutivo", event.target.value)} value={form.codigoEjecutivo} />
                  <Input label="Codigo dial" onChange={(event) => onFieldChange("codigoDial", event.target.value)} value={form.codigoDial} />
                  <Input label="Codigo propio" onChange={(event) => onFieldChange("codigoPropio", event.target.value)} value={form.codigoPropio} />
                  <Select label="Generacion" onChange={(event) => onFieldChange("generacionId", event.target.value)} options={generacionOptions} value={form.generacionId} />
                  <Select errorText={errorFor("jornadaId", formErrors)} label="Jornada" onChange={(event) => onFieldChange("jornadaId", event.target.value)} options={jornadaOptions} value={form.jornadaId} />
                  <Select errorText={errorFor("turnoId", formErrors)} label="Turno" onChange={(event) => onFieldChange("turnoId", event.target.value)} options={turnoOptions} value={form.turnoId} />
                  <Select errorText={errorFor("tipoContratoId", formErrors)} label="Tipo de contrato" onChange={(event) => onFieldChange("tipoContratoId", event.target.value)} options={tipoContratoOptions} value={form.tipoContratoId} />
                  <Select errorText={errorFor("areaId", formErrors)} label="Area actual" onChange={(event) => onFieldChange("areaId", event.target.value)} options={buildOptions(masters.areaItems, "Seleccione un area")} value={form.areaId} />
                  <Select errorText={errorFor("cargoId", formErrors)} label="Cargo actual" onChange={(event) => onFieldChange("cargoId", event.target.value)} options={buildOptions(masters.cargoItems, "Seleccione un cargo")} value={form.cargoId} />
                  <Select errorText={errorFor("tipoProductoId", formErrors)} label="Tipo de producto" onChange={(event) => onFieldChange("tipoProductoId", event.target.value)} options={productoOptions} value={form.tipoProductoId} />
                  <Input errorText={errorFor("fechaIngreso", formErrors)} label="Fecha de ingreso" onChange={(event) => onFieldChange("fechaIngreso", event.target.value)} type="date" value={form.fechaIngreso} />
                  <Select errorText={errorFor("bancoId", formErrors)} label="Banco" onChange={(event) => onFieldChange("bancoId", event.target.value)} options={bancoOptions} value={form.bancoId} />
                  <Input errorText={errorFor("numeroCuenta", formErrors)} label="Numero de cuenta" onChange={(event) => onFieldChange("numeroCuenta", event.target.value)} value={form.numeroCuenta} />
                  <Input errorText={errorFor("fechaInicioContrato", formErrors)} label="Fecha inicio contrato" onChange={(event) => onFieldChange("fechaInicioContrato", event.target.value)} type="date" value={form.fechaInicioContrato} />
                  <Input label="Fecha fin contrato" onChange={(event) => onFieldChange("fechaFinContrato", event.target.value)} type="date" value={form.fechaFinContrato} />
                  <Select errorText={errorFor("empresaId", formErrors)} label="Empresa" onChange={(event) => onFieldChange("empresaId", event.target.value)} options={empresaOptions} value={form.empresaId} />
                  <Input errorText={errorFor("sueldo", formErrors)} label="Sueldo" onChange={(event) => onFieldChange("sueldo", event.target.value)} type="number" value={form.sueldo} />
                  <Input label="Fecha de cambio" onChange={(event) => onFieldChange("fechaCambio", event.target.value)} type="date" value={form.fechaCambio} />
                  <Input label="Fecha de cese" onChange={(event) => onFieldChange("fechaCese", event.target.value)} type="date" value={form.fechaCese} />
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
                      return (
                        <label className={formErrors.campanias ? "flex items-center gap-3 rounded-xl border border-red-300 bg-red-50/60 px-3 py-3 text-sm text-slate-700" : "flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700"} key={item.itemMaestroId}>
                          <input checked={checked} className="h-4 w-4 rounded border-slate-300" onChange={() => onFieldChange("campanias", checked ? form.campanias.filter((value) => value !== String(item.itemMaestroId)) : [...form.campanias, String(item.itemMaestroId)])} type="checkbox" />
                          <span>{item.nombre}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </fieldset>
            </Section>

            <Section subtitle="Estado operativo del empleado, comentarios y subestado actual." title="Registro">
              <fieldset className="contents disabled:opacity-60" disabled={formFieldsDisabled}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Select errorText={errorFor("estadoId", formErrors)} label="Estado" onChange={(event) => onFieldChange("estadoId", event.target.value)} options={buildOptions(masters.estadoItems, "Seleccione un estado")} value={form.estadoId} />
                  <Select errorText={errorFor("subEstadoId", formErrors)} label="Subestado" onChange={(event) => onFieldChange("subEstadoId", event.target.value)} options={subEstadoOptions} value={form.subEstadoId} />
                </div>
                <Textarea label="Comentario" onChange={(event) => onFieldChange("comentario", event.target.value)} rows={3} value={form.comentario} />
              </fieldset>
            </Section>
          </div>
        </div>
      )}
    </Modal>
  );
}
