import { useMemo } from "react";
import { PERSONAL_PAGE_STYLES } from "@/config/styles";
import { PageHeader } from "@/components/layout";
import { Badge, Button, Card, Input, Pagination, Select, Table } from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import { usePagination } from "@/hooks";

type PersonalRow = {
  id: string;
  nombre: string;
  area: string;
  cargo: string;
  estado: "Activo" | "Vacaciones" | "Inactivo";
  fechaIngreso: string;
};

const PERSONAL_ROWS: PersonalRow[] = [
  { id: "1", nombre: "Ana Perez", area: "Administracion", cargo: "Analista", estado: "Activo", fechaIngreso: "2024-01-15" },
  { id: "2", nombre: "Luis Ramos", area: "Ventas", cargo: "Supervisor", estado: "Vacaciones", fechaIngreso: "2023-09-10" },
  { id: "3", nombre: "Carmen Diaz", area: "TI", cargo: "Soporte", estado: "Activo", fechaIngreso: "2022-07-03" },
  { id: "4", nombre: "Jorge Leon", area: "Back Office", cargo: "Operador", estado: "Activo", fechaIngreso: "2024-03-21" },
  { id: "5", nombre: "Rosa Vera", area: "Gerencia", cargo: "Asistente", estado: "Inactivo", fechaIngreso: "2021-11-08" },
  { id: "6", nombre: "Mario Soto", area: "Administracion", cargo: "Coordinador", estado: "Activo", fechaIngreso: "2020-05-17" },
  { id: "7", nombre: "Paola Ruiz", area: "Ventas", cargo: "Analista", estado: "Activo", fechaIngreso: "2025-01-11" },
] as const;

function estadoVariant(estado: PersonalRow["estado"]): "success" | "warning" | "danger" {
  if (estado === "Activo") {
    return "success";
  }

  if (estado === "Vacaciones") {
    return "warning";
  }

  return "danger";
}

export function PersonalPage(): JSX.Element {
  const { page, pageSize, paginatedItems, setPage, setPageSize, total } = usePagination({ items: PERSONAL_ROWS });

  const columns = useMemo<Array<TableColumn<PersonalRow>>>(
    () => [
      { key: "nombre", header: "Nombre", render: (row) => row.nombre },
      { key: "area", header: "Area", render: (row) => row.area },
      { key: "cargo", header: "Cargo", render: (row) => row.cargo },
      { key: "fechaIngreso", header: "Ingreso", render: (row) => row.fechaIngreso },
      { key: "estado", header: "Estado", render: (row) => <Badge variant={estadoVariant(row.estado)}>{row.estado}</Badge> },
      {
        key: "acciones",
        header: "Acciones",
        render: () => (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button size="sm" variant="edit">Editar</Button>
            <Button size="sm" variant="delete">Borrar</Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className={PERSONAL_PAGE_STYLES.page}>
      <PageHeader
        actions={
          <>
            <Button variant="export">Exportar</Button>
            <Button variant="create">Nuevo personal</Button>
          </>
        }
        subtitle="Gestion de personal y registros asociados"
        tag="Administracion"
        title="Personal"
      />

      <section className={PERSONAL_PAGE_STYLES.topGrid}>
        <Card subtitle="Filtros de busqueda y consulta" title="Filtros">
          <div className={PERSONAL_PAGE_STYLES.filtersGrid}>
            <Input label="Buscar" placeholder="Nombre o documento" />
            <Select
              label="Area"
              options={[
                { label: "Todas", value: "" },
                { label: "Administracion", value: "Administracion" },
                { label: "Ventas", value: "Ventas" },
                { label: "TI", value: "TI" },
              ]}
            />
            <Select
              label="Estado"
              options={[
                { label: "Todos", value: "" },
                { label: "Activo", value: "Activo" },
                { label: "Vacaciones", value: "Vacaciones" },
                { label: "Inactivo", value: "Inactivo" },
              ]}
            />
            <Select
              label="Cargo"
              options={[
                { label: "Todos", value: "" },
                { label: "Analista", value: "Analista" },
                { label: "Supervisor", value: "Supervisor" },
                { label: "Coordinador", value: "Coordinador" },
              ]}
            />
          </div>
          <div className={PERSONAL_PAGE_STYLES.filtersActions}>
            <Button variant="clear">Limpiar</Button>
            <Button variant="search">Buscar</Button>
          </div>
        </Card>

        <div className={PERSONAL_PAGE_STYLES.panelStack}>
          <div className={PERSONAL_PAGE_STYLES.metricsGrid}>
            <div className={PERSONAL_PAGE_STYLES.metricCard}>
              <p className={PERSONAL_PAGE_STYLES.metricLabel}>Personal activo</p>
              <p className={PERSONAL_PAGE_STYLES.metricValue}>124</p>
              <p className={PERSONAL_PAGE_STYLES.metricMeta}>+6 este mes</p>
            </div>
            <div className={PERSONAL_PAGE_STYLES.metricCard}>
              <p className={PERSONAL_PAGE_STYLES.metricLabel}>Vacaciones</p>
              <p className={PERSONAL_PAGE_STYLES.metricValue}>08</p>
              <p className={PERSONAL_PAGE_STYLES.metricMeta}>Programadas esta semana</p>
            </div>
          </div>
          <Card subtitle="Resumen del modulo" title="Estado">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-sm text-slate-600">Legajos actualizados</span>
                <Badge variant="success">92%</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-sm text-slate-600">Contratos por renovar</span>
                <Badge variant="warning">14</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-sm text-slate-600">Incidencias RRHH</span>
                <Badge variant="danger">03</Badge>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Card subtitle="Tabla principal de administracion de personal" title="Listado de personal">
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
  );
}

export default PersonalPage;
