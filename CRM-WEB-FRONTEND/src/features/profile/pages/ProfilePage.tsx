import { useEffect, useMemo, useState } from "react";
import { PROFILE_PAGE_STYLES } from "@/config/styles";
import { PageHeader } from "@/components/layout";
import { ErrorState, LoadingState } from "@/components/common";
import { Badge, Button, Card, Input, Pagination, Table, Textarea } from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import { usePagination } from "@/hooks";
import type { MiPerfilPermiso, MiPerfilResponse, MiPerfilRol } from "@/types";
import { profileService } from "@/services";

type RowRol = MiPerfilRol;
type RowPermiso = MiPerfilPermiso;

function formatDate(value?: string | null, withTime = false): string {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(parsed);
}

function formatCurrency(value?: number | null): string {
  if (value == null) return "-";

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);
}

function getInitials(name?: string | null): string {
  if (!name) return "AU";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function ProfilePage(): JSX.Element {
  const [profile, setProfile] = useState<MiPerfilResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await profileService.getMyProfile();
      setProfile(response);
    } catch (rawError) {
      const message = rawError instanceof Error ? rawError.message : "No se pudo obtener la informacion del perfil.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const rolesColumns = useMemo<Array<TableColumn<RowRol>>>(
    () => [
      { key: "rol", header: "Rol", render: (row) => row.rolNombre || "-" },
      { key: "codigo", header: "Codigo", render: (row) => row.rolCodigo || "-" },
      {
        key: "estado",
        header: "Estado",
        render: (row) => <Badge variant={row.usuarioRolActivo ? "success" : "warning"}>{row.usuarioRolActivo ? "Activo" : "Inactivo"}</Badge>,
      },
    ],
    [],
  );

  const permisosColumns = useMemo<Array<TableColumn<RowPermiso>>>(
    () => [
      { key: "modulo", header: "Modulo", render: (row) => row.moduloNombre || row.moduloCodigo || "-" },
      { key: "permiso", header: "Permiso", render: (row) => row.permisoNombre || row.permisoCodigo || "-" },
      {
        key: "permitido",
        header: "Acceso",
        render: (row) => <Badge variant={row.permitido ? "success" : "warning"}>{row.permitido ? "Permitido" : "Restringido"}</Badge>,
      },
    ],
    [],
  );

  const {
    page: permisosPage,
    pageSize: permisosPageSize,
    paginatedItems: permisosPaginados,
    setPage: setPermisosPage,
    setPageSize: setPermisosPageSize,
    total: permisosTotal,
  } = usePagination<RowPermiso>({
    items: profile?.permisos ?? [],
    initialPageSize: 20,
  });

  if (isLoading) {
    return <LoadingState description="Estamos cargando su informacion personal y accesos." title="Cargando mi perfil" />;
  }

  if (error || !profile?.resumen) {
    return (
      <ErrorState
        description={error || "No se encontro informacion disponible para este perfil."}
        onRetry={() => {
          void loadProfile();
        }}
        title="No se pudo cargar Mi Perfil"
      />
    );
  }

  const { resumen, roles } = profile;
  const summaryName = resumen.nombreCompleto || resumen.usuario || "Usuario";
  const summaryEmail = resumen.correoCorporativo || resumen.correoPersonal || "-";
  const summaryRole = roles[0]?.rolNombre || "Sin rol asignado";
  const summaryArea = resumen.contratacionAreaNombre || resumen.postulacionAreaNombre || "-";
  const summaryCargo = resumen.contratacionCargoNombre || resumen.postulacionCargoNombre || "-";
  const summaryEstado = resumen.estadoNombre || "No definido";
  const summaryPhoto = resumen.fotoUrl?.trim();

  return (
    <div className={PROFILE_PAGE_STYLES.page}>
      <PageHeader
        actions={
          <Button onClick={() => void loadProfile()} variant="search">
            Actualizar
          </Button>
        }
        subtitle="Consulta de datos del usuario autenticado desde el nuevo endpoint de perfil"
        tag="Mi Perfil"
        title="Perfil de usuario"
      />

      <section className={PROFILE_PAGE_STYLES.grid}>
        <div className={PROFILE_PAGE_STYLES.stack}>
          <Card subtitle="Informacion principal del usuario autenticado" title="Resumen">
            <div className={PROFILE_PAGE_STYLES.summaryCard}>
              <div className={PROFILE_PAGE_STYLES.avatarWrap}>
                {summaryPhoto ? (
                  <img alt={summaryName} className={PROFILE_PAGE_STYLES.avatar} src={summaryPhoto} />
                ) : (
                  <div className={PROFILE_PAGE_STYLES.avatar}>{getInitials(summaryName)}</div>
                )}
                <div>
                  <p className={PROFILE_PAGE_STYLES.summaryName}>{summaryName}</p>
                  <p className={PROFILE_PAGE_STYLES.summaryMeta}>{summaryEmail}</p>
                  <p className={PROFILE_PAGE_STYLES.summaryMeta}>{summaryCargo} · {summaryArea}</p>
                </div>
              </div>
              <div className={PROFILE_PAGE_STYLES.tagRow}>
                <span className={PROFILE_PAGE_STYLES.tag}>{summaryRole}</span>
                <span className={PROFILE_PAGE_STYLES.tag}>{summaryEstado}</span>
                <span className={PROFILE_PAGE_STYLES.tag}>Ultimo acceso: {formatDate(resumen.ultimoLogin, true)}</span>
              </div>
            </div>
          </Card>

          <Card subtitle="Asignaciones del usuario en el sistema" title="Roles asignados">
            <Table columns={rolesColumns} emptyMessage="No hay roles asignados." getRowKey={(row) => String(row.usuarioRolId)} rows={roles} />
          </Card>

          <Card subtitle="Tabla estandar con paginacion" title="Permisos efectivos">
            <div className="space-y-4">
              <Table
                columns={permisosColumns}
                emptyMessage="No hay permisos efectivos para mostrar."
                getRowKey={(row) => `${row.moduloId}-${row.permisoId}`}
                rows={permisosPaginados}
              />
              <Pagination
                onPageChange={setPermisosPage}
                onPageSizeChange={(value) => {
                  setPermisosPageSize(value);
                  setPermisosPage(1);
                }}
                page={permisosPage}
                pageSize={permisosPageSize}
                total={permisosTotal}
              />
            </div>
          </Card>
        </div>

        <div className={PROFILE_PAGE_STYLES.activityStack}>
          <Card subtitle="Datos consultados desde su ficha laboral" title="Datos personales">
            <div className={PROFILE_PAGE_STYLES.formGrid}>
              <Input containerClassName={PROFILE_PAGE_STYLES.full} disabled label="Nombres y apellidos" value={summaryName} />
              <Input disabled label="Usuario" value={resumen.usuario || "-"} />
              <Input disabled label="Tipo de documento" value={resumen.tipoDocumentoNombre || "-"} />
              <Input disabled label="Correo corporativo" value={resumen.correoCorporativo || "-"} />
              <Input disabled label="Correo personal" value={resumen.correoPersonal || "-"} />
              <Input disabled label="Celular personal" value={resumen.celularPersonal || "-"} />
              <Input disabled label="Fecha de nacimiento" value={formatDate(resumen.fechaNacimiento)} />
              <Input disabled label="Edad" value={resumen.edad || "-"} />
              <Input disabled label="Sexo" value={resumen.sexoNombre || "-"} />
              <Input disabled label="Estado civil" value={resumen.estadoCivilNombre || "-"} />
              <Input disabled label="Nivel de estudios" value={resumen.nivelEstudiosNombre || "-"} />
              <Input disabled label="Nacionalidad" value={resumen.nacionalidad || "-"} />
              <Input disabled label="Departamento" value={resumen.departamento || "-"} />
              <Input disabled label="Provincia" value={resumen.provincia || "-"} />
              <Input disabled label="Distrito" value={resumen.distrito || "-"} />
              <Input containerClassName={PROFILE_PAGE_STYLES.full} disabled label="Direccion" value={resumen.direccion || "-"} />
              <Textarea containerClassName={PROFILE_PAGE_STYLES.full} disabled label="Referencia" value={resumen.direccionReferencia || "-"} />
            </div>
          </Card>

          <Card subtitle="Informacion contractual y laboral actual" title="Datos laborales">
            <div className={PROFILE_PAGE_STYLES.formGrid}>
              <Input disabled label="Area" value={summaryArea} />
              <Input disabled label="Cargo" value={summaryCargo} />
              <Input disabled label="Campania" value={resumen.campaniaNombre || "-"} />
              <Input disabled label="Producto" value={resumen.productoNombre || "-"} />
              <Input disabled label="Jefe inmediato" value={resumen.jefeNombreCompleto || "-"} />
              <Input disabled label="Tipo de contrato" value={resumen.tipoContratoNombre || "-"} />
              <Input disabled label="Jornada" value={resumen.jornadaNombre || "-"} />
              <Input disabled label="Turno" value={resumen.turnoNombre || "-"} />
              <Input disabled label="Fecha de ingreso" value={formatDate(resumen.fechaIngreso)} />
              <Input disabled label="Fecha inicio contrato" value={formatDate(resumen.fechaInicioContrato)} />
              <Input disabled label="Fecha fin contrato" value={formatDate(resumen.fechaFinContrato)} />
              <Input disabled label="Sueldo" value={formatCurrency(resumen.sueldo)} />
              <Input disabled label="Banco" value={resumen.bancoNombre || "-"} />
              <Input disabled label="Numero de cuenta" value={resumen.numeroCuenta || "-"} />
              <Input disabled label="Empresa" value={resumen.empresaNombre || "-"} />
              <Input disabled label="Estado / Subestado" value={[resumen.estadoNombre, resumen.subEstadoNombre].filter(Boolean).join(" / ") || "-"} />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
