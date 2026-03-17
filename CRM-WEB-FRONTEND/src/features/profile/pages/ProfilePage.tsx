import { useMemo, useState } from "react";
import { PROFILE_PAGE_STYLES } from "@/config/styles";
import { PageHeader } from "@/components/layout";
import { Badge, Button, Card, Input, Pagination, Select, Table, Textarea } from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import { usePagination } from "@/hooks";

type ActivityRow = {
  id: string;
  accion: string;
  modulo: string;
  fecha: string;
  estado: "OK" | "Pendiente";
};

const ACTIVITY_ROWS: ActivityRow[] = [
  { id: "1", accion: "Actualizo datos de contacto", modulo: "Mi Perfil", fecha: "2026-02-24 09:10", estado: "OK" },
  { id: "2", accion: "Cambio de contrasena solicitado", modulo: "Seguridad", fecha: "2026-02-23 17:42", estado: "OK" },
  { id: "3", accion: "Exporto reporte", modulo: "Gerencia", fecha: "2026-02-23 14:20", estado: "Pendiente" },
  { id: "4", accion: "Ingreso al sistema", modulo: "Auth", fecha: "2026-02-23 08:01", estado: "OK" },
  { id: "5", accion: "Actualizo firma", modulo: "Mi Perfil", fecha: "2026-02-22 12:34", estado: "OK" },
] as const;

export function ProfilePage(): JSX.Element {
  const [form, setForm] = useState({
    nombres: "ALMPES User",
    correo: "user@almpes.local",
    telefono: "+51 999 999 999",
    area: "Administracion",
    cargo: "Supervisor",
    bio: "Responsable del seguimiento operativo y coordinacion con administracion.",
  });

  const { page, pageSize, paginatedItems, setPage, setPageSize, total } = usePagination({ items: ACTIVITY_ROWS });

  const columns = useMemo<Array<TableColumn<ActivityRow>>>(
    () => [
      { key: "accion", header: "Accion", render: (row) => row.accion },
      { key: "modulo", header: "Modulo", render: (row) => row.modulo },
      { key: "fecha", header: "Fecha", render: (row) => row.fecha },
      {
        key: "estado",
        header: "Estado",
        render: (row) => <Badge variant={row.estado === "OK" ? "success" : "warning"}>{row.estado}</Badge>,
      },
    ],
    [],
  );

  return (
    <div className={PROFILE_PAGE_STYLES.page}>
      <PageHeader
        actions={
          <>
            <Button variant="clear">Cancelar</Button>
            <Button variant="save">Guardar cambios</Button>
          </>
        }
        subtitle="Gestion de datos del usuario autenticado"
        tag="Mi Perfil"
        title="Perfil de usuario"
      />

      <section className={PROFILE_PAGE_STYLES.grid}>
        <div className={PROFILE_PAGE_STYLES.stack}>
          <Card subtitle="Informacion del usuario y permisos base" title="Resumen">
            <div className={PROFILE_PAGE_STYLES.summaryCard}>
              <div className={PROFILE_PAGE_STYLES.avatarWrap}>
                <div className={PROFILE_PAGE_STYLES.avatar}>AU</div>
                <div>
                  <p className={PROFILE_PAGE_STYLES.summaryName}>{form.nombres}</p>
                  <p className={PROFILE_PAGE_STYLES.summaryMeta}>{form.correo}</p>
                  <p className={PROFILE_PAGE_STYLES.summaryMeta}>{form.cargo} · {form.area}</p>
                </div>
              </div>
              <div className={PROFILE_PAGE_STYLES.tagRow}>
                <span className={PROFILE_PAGE_STYLES.tag}>Acceso ERP/CRM</span>
                <span className={PROFILE_PAGE_STYLES.tag}>Rol Supervisor</span>
                <span className={PROFILE_PAGE_STYLES.tag}>Sesion activa</span>
              </div>
            </div>
          </Card>

          <Card subtitle="Configuraciones frecuentes" title="Preferencias">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Notificaciones por correo</p>
                  <p className="text-xs text-slate-500">Resumen diario de actividad y alertas.</p>
                </div>
                <Badge variant="success">Activas</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Doble verificacion</p>
                  <p className="text-xs text-slate-500">Seguridad de acceso al sistema.</p>
                </div>
                <Badge variant="warning">Pendiente</Badge>
              </div>
            </div>
          </Card>
        </div>

        <div className={PROFILE_PAGE_STYLES.activityStack}>
          <Card subtitle="Actualice su informacion personal" title="Datos personales">
            <div className={PROFILE_PAGE_STYLES.formGrid}>
              <Input
                containerClassName={PROFILE_PAGE_STYLES.full}
                label="Nombres y apellidos"
                onChange={(event) => setForm((current) => ({ ...current, nombres: event.target.value }))}
                value={form.nombres}
              />
              <Input
                label="Correo"
                onChange={(event) => setForm((current) => ({ ...current, correo: event.target.value }))}
                type="email"
                value={form.correo}
              />
              <Input
                label="Telefono"
                onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))}
                value={form.telefono}
              />
              <Select
                label="Area"
                onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))}
                options={[
                  { label: "Administracion", value: "Administracion" },
                  { label: "Ventas", value: "Ventas" },
                  { label: "TI", value: "TI" },
                ]}
                value={form.area}
              />
              <Select
                label="Cargo"
                onChange={(event) => setForm((current) => ({ ...current, cargo: event.target.value }))}
                options={[
                  { label: "Supervisor", value: "Supervisor" },
                  { label: "Analista", value: "Analista" },
                  { label: "Coordinador", value: "Coordinador" },
                ]}
                value={form.cargo}
              />
              <Textarea
                containerClassName={PROFILE_PAGE_STYLES.full}
                label="Bio"
                onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                value={form.bio}
              />
            </div>
            <div className={PROFILE_PAGE_STYLES.actions}>
              <Button variant="clear">Limpiar</Button>
              <Button variant="save">Guardar perfil</Button>
            </div>
          </Card>

          <Card subtitle="Tabla de movimientos recientes" title="Actividad reciente">
            <div className="space-y-4">
              <Table columns={columns} getRowKey={(row) => row.id} rows={paginatedItems} />
              <Pagination
                onPageChange={setPage}
                onPageSizeChange={(value) => {
                  setPageSize(value);
                  setPage(1);
                }}
                page={page}
                pageSize={pageSize}
                total={total}
              />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
