import { ChangeEvent, useEffect, useState } from "react";
import { PROFILE_PAGE_STYLES } from "@/config/styles";
import { ErrorState, LoadingState } from "@/components/common";
import { Card, Input, Textarea } from "@/components/ui";
import type { MiPerfilResponse } from "@/types";
import { profileService } from "@/services";

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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handlePhotoSelected = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview(URL.createObjectURL(selectedFile));
  };

  if (isLoading) {
    return <LoadingState description="Estamos cargando su informacion personal y laboral." title="Cargando mi perfil" />;
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
  const summaryPhoto = photoPreview || resumen.fotoUrl?.trim();

  return (
    <div className={PROFILE_PAGE_STYLES.page}>
      <section className={PROFILE_PAGE_STYLES.topGrid}>
        <Card bodyClassName="pt-5" subtitle="Informacion principal del usuario autenticado" title="Resumen">
          <div className={PROFILE_PAGE_STYLES.summaryPanel}>
            <div className="space-y-5">
              <div className={PROFILE_PAGE_STYLES.avatarWrap}>
                {summaryPhoto ? (
                  <img alt={summaryName} className={PROFILE_PAGE_STYLES.avatar} src={summaryPhoto} />
                ) : (
                  <div className={PROFILE_PAGE_STYLES.avatar}>{getInitials(summaryName)}</div>
                )}

                <div className={PROFILE_PAGE_STYLES.summaryIdentity}>
                  <p className={PROFILE_PAGE_STYLES.summaryName}>{summaryName}</p>
                  <p className={PROFILE_PAGE_STYLES.summaryMeta}>{summaryEmail}</p>
                  <p className={PROFILE_PAGE_STYLES.summaryMeta}>
                    {summaryCargo} · {summaryArea}
                  </p>
                </div>
              </div>

              <div className={PROFILE_PAGE_STYLES.tagRow}>
                <span className={PROFILE_PAGE_STYLES.tag}>{summaryRole}</span>
                <span className={PROFILE_PAGE_STYLES.tag}>{summaryEstado}</span>
                <span className={PROFILE_PAGE_STYLES.tag}>Ultimo acceso: {formatDate(resumen.ultimoLogin, true)}</span>
              </div>
            </div>

            <div className={PROFILE_PAGE_STYLES.summaryActionWrap}>
              <label className={PROFILE_PAGE_STYLES.summaryUploadBtn} htmlFor="profile-photo-upload">
                Subir foto
              </label>
              <input
                accept="image/*"
                className={PROFILE_PAGE_STYLES.hiddenInput}
                id="profile-photo-upload"
                onChange={handlePhotoSelected}
                type="file"
              />
            </div>
          </div>
        </Card>
      </section>

      <section className={PROFILE_PAGE_STYLES.detailGrid}>
        <Card bodyClassName="pt-5" className={PROFILE_PAGE_STYLES.detailCard} subtitle="Datos consultados desde su ficha laboral" title="Datos personales">
          <div className={PROFILE_PAGE_STYLES.formGrid}>
            <Input disabled label="Usuario" value={resumen.usuario || "-"} />
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

        <Card bodyClassName="pt-5" className={PROFILE_PAGE_STYLES.detailCard} subtitle="Informacion contractual y laboral actual" title="Datos laborales">
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
      </section>
    </div>
  );
}

export default ProfilePage;
