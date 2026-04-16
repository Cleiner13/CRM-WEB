import { useEffect, useMemo, useState } from "react";
import { Pencil, UserX } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import { empleadosService, itemsMaestrosService, profileService, tablasMaestrasService } from "@/services";
import type { EmpleadoListItem, ListEmpleadosParams, MiPerfilPermiso } from "@/types";
import { formatDate, hasModulePermissionByCode } from "@/utils";
import { ACTION_CODES, EMPTY_FORM, EMPTY_MASTERS, PERSONAL_MODULE_CODE } from "../constants/personalConstants";
import type { DocumentGate, FormField, MasterCollections, ModalTone, PersonalFormState } from "../types/personalTypes";
import { buildFormErrors, buildMissingFieldsMessage, isFieldEmpty, REQUIRED_FIELDS } from "../utils/personalFormValidation";
import { buildOptions, buildSavePayload, downloadCsv, findTableId, fullName, getDocumentMeta, mapDetailToForm, splitPeruApiNames } from "../utils/personalUtils";

export function usePersonalPage() {
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

  const documentMeta = useMemo(() => getDocumentMeta(selectedTipoDocumento), [selectedTipoDocumento]);
  const numeroDocumentoDisabled = employeeModalMode === "edit" ? true : !form.tipoDocumentoId;

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
          tipoDocumentoItems,
          sexoItems,
          areaItems,
          cargoItems,
          estadoItems,
          subEstadoItems,
          estadoCivilItems,
          nivelEstudiosItems,
          origenItems,
          campaniaItems,
          productoItems,
          generacionItems,
          jornadaItems,
          turnoItems,
          tipoContratoItems,
          bancoItems,
          empresaItems,
          parentescoItems,
          employeeList,
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
          tipoDocumentoItems,
          sexoItems,
          areaItems,
          cargoItems,
          estadoItems,
          subEstadoItems,
          estadoCivilItems,
          nivelEstudiosItems,
          origenItems,
          campaniaItems,
          productoItems,
          generacionItems,
          jornadaItems,
          turnoItems,
          tipoContratoItems,
          bancoItems,
          empresaItems,
          parentescoItems,
        });
        setEmployeeOptions(employeeList.items);
      } catch (error) {
        if (active) {
          setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudieron cargar los catalogos de personal.", variant: "error" });
        }
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
      setDocumentGateMessage("Seleccione tipo de documento para habilitar el numero de documento.");
      return undefined;
    }

    if (!numeroDocumento) {
      setDocumentGate("idle");
      setDocumentGateMessage(
        documentMeta.expectedLength
          ? `Ingrese ${documentMeta.expectedLength} digitos para ${documentMeta.label}.`
          : "Ingrese el numero de documento.",
      );
      return undefined;
    }

    if (documentMeta.expectedLength && numeroDocumento.length < documentMeta.expectedLength) {
      setDocumentGate("idle");
      setDocumentGateMessage(`El ${documentMeta.label} debe tener ${documentMeta.expectedLength} digitos.`);
      return undefined;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      try {
        if (documentMeta.kind !== "DNI") {
          setDocumentGate("ready");
          setDocumentGateMessage(documentMeta.kind === "CE" ? "Carnet de Extranjeria valido. Complete la ficha manualmente." : "Documento valido. Puede continuar con la ficha.");
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
            })}. Busquelo en los registros de personal para editarlo.`,
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
  }, [employeeModalMode, employeeModalOpen, form.numeroDocumento, form.tipoDocumentoId, documentMeta]);

  const areaOptions = useMemo(() => buildOptions(masters.areaItems, "Todas las areas"), [masters.areaItems]);
  const cargoOptions = useMemo(() => buildOptions(masters.cargoItems, "Todos los cargos"), [masters.cargoItems]);
  const estadoOptions = useMemo(() => buildOptions(masters.estadoItems, "Todos los estados"), [masters.estadoItems]);
  const visibleActiveCount = useMemo(() => employees.filter((item) => item.activo).length, [employees]);
  const visibleWithUserCount = useMemo(() => employees.filter((item) => item.usuarioId && item.usuarioActivo).length, [employees]);
  const formFieldsDisabled = employeeModalMode === "create" && documentGate !== "ready";

  const handleClearFilters = async (): Promise<void> => {
    if (!(await ensureActionPermission(ACTION_CODES.clear, "limpiar"))) return;
    setSearch("");
    setOnlyActive(true);
    setAreaId("");
    setCargoId("");
    setEstadoId("");
    setPage(1);
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
    try {
      setForm(mapDetailToForm(await empleadosService.getById(employee.empleadoId)));
    } catch (error) {
      setEmployeeModalOpen(false);
      setFeedback({ title: "No se pudo continuar", message: error instanceof Error ? error.message : "No se pudo cargar el detalle del empleado.", variant: "error" });
    } finally {
      setLoadingEmployee(false);
    }
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
      setFeedback({ title: "Datos incompletos", message: buildMissingFieldsMessage(missingFields), variant: "warning" });
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
    } finally {
      setSavingEmployee(false);
    }
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
    } finally {
      setProcessingDeactivate(false);
    }
  };

  const handleExport = async (): Promise<void> => {
    if (!(await ensureActionPermission(ACTION_CODES.export, "exportar"))) return;
    try {
      const response = await empleadosService.list({
        pagina: 1,
        tamanio: 5000,
        texto: search.trim() || undefined,
        soloActivos: onlyActive,
        estadoId: estadoId ? Number(estadoId) : undefined,
        areaId: areaId ? Number(areaId) : undefined,
        cargoId: cargoId ? Number(cargoId) : undefined,
      });
      downloadCsv("personal.csv", [["Documento", "Nombre", "Area", "Cargo", "Estado laboral", "Acceso", "Ingreso"], ...response.items.map((item) => [
        item.numeroDocumento ?? "-",
        fullName(item),
        item.areaNombre ?? "-",
        item.cargoNombre ?? "-",
        item.activo ? "Activo" : "Inactivo",
        item.usuarioActivo ? "Acceso activo" : "Sin acceso",
        item.fechaCreacion ? formatDate(item.fechaCreacion) : "-",
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
      setDocumentGateMessage("Seleccione tipo de documento para habilitar el numero de documento.");
      return;
    }

    if (meta.expectedLength) {
      setDocumentGate("idle");
      setDocumentGateMessage(`Ingrese ${meta.expectedLength} digitos para ${meta.label}.`);
      return;
    }

    setDocumentGate("idle");
    setDocumentGateMessage("Ingrese el numero de documento.");
  };

  const handleNumeroDocumentoChange = (value: string): void => {
    const onlyDigits = value.replace(/\D/g, "");
    const maxLength = documentMeta.expectedLength ?? 20;
    setField("numeroDocumento", onlyDigits.slice(0, maxLength));
  };

  const columns = useMemo<Array<TableColumn<EmpleadoListItem>>>(() => [
    {
      key: "nombre",
      header: "Personal",
      className: "text-left",
      render: (row) => (
        <div className="space-y-1 text-left">
          <p className="text-sm font-semibold text-slate-900">{fullName(row)}</p>
          <p className="text-xs text-slate-500">{row.numeroDocumento || "-"}</p>
          <p className="text-xs text-slate-400">{row.usuarioLogin || "Sin usuario"}</p>
        </div>
      ),
    },
    { key: "area", header: "Area", className: "text-left", render: (row) => <span className="text-sm text-slate-700">{row.areaNombre || "-"}</span> },
    { key: "cargo", header: "Cargo", className: "text-left", render: (row) => <span className="text-sm text-slate-700">{row.cargoNombre || "-"}</span> },
    {
      key: "estado",
      header: "Estado",
      render: (row) => (
        <div className="flex flex-col items-center gap-2">
          <Badge variant={row.activo ? "success" : "danger"}>{row.activo ? "Activo" : "Inactivo"}</Badge>
          <Badge variant={row.usuarioActivo ? "info" : "neutral"}>{row.usuarioActivo ? "Acceso activo" : "Sin acceso"}</Badge>
        </div>
      ),
    },
    { key: "fechaCreacion", header: "Ingreso", render: (row) => <span className="text-sm text-slate-700">{formatDate(row.fechaCreacion)}</span> },
    {
      key: "acciones",
      header: "Acciones",
      render: (row) => (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button leftIcon={<Pencil size={14} />} onClick={() => void openEditModal(row)} size="sm" variant="edit">Editar</Button>
          {row.activo ? (
            <Button leftIcon={<UserX size={14} />} onClick={() => setConfirmDeactivate(row)} size="sm" variant="delete">Inactivar</Button>
          ) : (
            <Badge variant="neutral">Inactivo</Badge>
          )}
        </div>
      ),
    },
  ], []);

  return {
    areaId,
    areaOptions,
    cargoId,
    cargoOptions,
    columns,
    confirmDeactivate,
    documentGate,
    documentGateMessage,
    documentMeta,
    employeeModalMode,
    employeeModalOpen,
    employeeOptions,
    employees,
    estadoId,
    estadoOptions,
    feedback,
    form,
    formErrors,
    formFieldsDisabled,
    loading,
    loadingEmployee,
    masters,
    numeroDocumentoDisabled,
    onlyActive,
    page,
    pageSize,
    processingDeactivate,
    savingEmployee,
    search,
    total,
    visibleActiveCount,
    visibleWithUserCount,
    handleClearFilters,
    handleDeactivate,
    handleExport,
    handleNumeroDocumentoChange,
    handleSave,
    handleTipoDocumentoChange,
    openCreateModal,
    setAreaId,
    setCargoId,
    setConfirmDeactivate,
    setEmployeeModalOpen,
    setEstadoId,
    setFeedback,
    setField,
    setForm,
    setFormErrors,
    setOnlyActive,
    setPage,
    setPageSize,
    setSearch,
  };
}
