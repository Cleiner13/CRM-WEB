import { useMemo } from "react";
import { FEATURE_SCAFFOLD_STYLES } from "@/config/styles";
import { usePagination } from "@/hooks";
import { PageHeader } from "@/components/layout";
import { Badge, Button, Card, Pagination, Table, Toast } from "@/components/ui";
import type { TableColumn } from "@/components/ui";

export type FeatureScaffoldPageProps = {
  title: string;
  subtitle: string;
};

type DemoRow = {
  id: string;
  codigo: string;
  descripcion: string;
  estado: "Activo" | "Pendiente" | "Bloqueado";
};

const DEMO_ROWS: DemoRow[] = [
  { id: "1", codigo: "ALM-001", descripcion: "Registro de ejemplo 1", estado: "Activo" },
  { id: "2", codigo: "ALM-002", descripcion: "Registro de ejemplo 2", estado: "Pendiente" },
  { id: "3", codigo: "ALM-003", descripcion: "Registro de ejemplo 3", estado: "Bloqueado" },
  { id: "4", codigo: "ALM-004", descripcion: "Registro de ejemplo 4", estado: "Activo" },
  { id: "5", codigo: "ALM-005", descripcion: "Registro de ejemplo 5", estado: "Pendiente" },
  { id: "6", codigo: "ALM-006", descripcion: "Registro de ejemplo 6", estado: "Activo" },
  { id: "7", codigo: "ALM-007", descripcion: "Registro de ejemplo 7", estado: "Bloqueado" },
  { id: "8", codigo: "ALM-008", descripcion: "Registro de ejemplo 8", estado: "Activo" },
  { id: "9", codigo: "ALM-009", descripcion: "Registro de ejemplo 9", estado: "Pendiente" },
  { id: "10", codigo: "ALM-010", descripcion: "Registro de ejemplo 10", estado: "Activo" },
  { id: "11", codigo: "ALM-011", descripcion: "Registro de ejemplo 11", estado: "Activo" },
  { id: "12", codigo: "ALM-012", descripcion: "Registro de ejemplo 12", estado: "Pendiente" },
] as const;

function badgeVariantForEstado(estado: DemoRow["estado"]): "success" | "warning" | "danger" {
  if (estado === "Activo") {
    return "success";
  }

  if (estado === "Pendiente") {
    return "warning";
  }

  return "danger";
}

export function FeatureScaffoldPage({ subtitle, title }: FeatureScaffoldPageProps): JSX.Element {
  const { page, pageSize, paginatedItems, setPage, setPageSize, total } = usePagination({ items: DEMO_ROWS });

  const columns = useMemo<Array<TableColumn<DemoRow>>>(
    () => [
      { key: "codigo", header: "Codigo", render: (row) => row.codigo },
      { key: "descripcion", header: "Descripcion", render: (row) => row.descripcion },
      {
        key: "estado",
        header: "Estado",
        render: (row) => <Badge variant={badgeVariantForEstado(row.estado)}>{row.estado}</Badge>,
      },
      {
        key: "acciones",
        header: "Acciones",
        render: () => (
          <div className={FEATURE_SCAFFOLD_STYLES.toolbar}>
            <Button size="sm" variant="edit">
              Editar
            </Button>
            <Button size="sm" variant="delete">
              Borrar
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className={FEATURE_SCAFFOLD_STYLES.page}>
      <PageHeader
        actions={
          <div className={FEATURE_SCAFFOLD_STYLES.toolbar}>
            <Button variant="search">Buscar</Button>
            <Button variant="clear">Limpiar</Button>
            <Button variant="create">Crear</Button>
            <Button variant="export">Exportar</Button>
          </div>
        }
        subtitle={subtitle}
        tag="Modulo"
        title={title}
      />

      <Toast message="Este modulo esta en modo scaffold listo para integracion de APIs." title="UI ALMPES lista" variant="info" />

      <section className={FEATURE_SCAFFOLD_STYLES.heroGrid}>
        <div className={FEATURE_SCAFFOLD_STYLES.heroPanel}>
          <p className={FEATURE_SCAFFOLD_STYLES.heroTitle}>Espacio de trabajo del modulo</p>
          <p className={FEATURE_SCAFFOLD_STYLES.heroText}>
            Estructura base lista para conectar servicios, hooks y validaciones manteniendo el sistema de diseño ALMPES.
          </p>
          <div className={FEATURE_SCAFFOLD_STYLES.heroActions}>
            <Button variant="search">Buscar</Button>
            <Button variant="clear">Limpiar</Button>
            <Button variant="save">Guardar</Button>
          </div>
          <div className={FEATURE_SCAFFOLD_STYLES.chipsRow}>
            <span className={FEATURE_SCAFFOLD_STYLES.chip}>Desktop-first</span>
            <span className={FEATURE_SCAFFOLD_STYLES.chip}>Paginacion obligatoria</span>
            <span className={FEATURE_SCAFFOLD_STYLES.chip}>Tokens ALMPES</span>
            <span className={FEATURE_SCAFFOLD_STYLES.chip}>UI reusable</span>
          </div>
        </div>

        <div className={FEATURE_SCAFFOLD_STYLES.sideStack}>
          <Card subtitle="Checklist rapido del scaffold" title="Preparacion">
            <div className={FEATURE_SCAFFOLD_STYLES.taskList}>
              <div className={FEATURE_SCAFFOLD_STYLES.taskItem}>
                <span aria-hidden="true" className={FEATURE_SCAFFOLD_STYLES.taskBullet} />
                <div>
                  <p className={FEATURE_SCAFFOLD_STYLES.taskTitle}>Conectar servicios del modulo</p>
                  <p className={FEATURE_SCAFFOLD_STYLES.taskMeta}>features/modulo/services</p>
                </div>
              </div>
              <div className={FEATURE_SCAFFOLD_STYLES.taskItem}>
                <span aria-hidden="true" className={FEATURE_SCAFFOLD_STYLES.taskBullet} />
                <div>
                  <p className={FEATURE_SCAFFOLD_STYLES.taskTitle}>Agregar filtros con Input/Select</p>
                  <p className={FEATURE_SCAFFOLD_STYLES.taskMeta}>Focus azul / error rojo</p>
                </div>
              </div>
              <div className={FEATURE_SCAFFOLD_STYLES.taskItem}>
                <span aria-hidden="true" className={FEATURE_SCAFFOLD_STYLES.taskBullet} />
                <div>
                  <p className={FEATURE_SCAFFOLD_STYLES.taskTitle}>Implementar estados Loading/Empty/Error</p>
                  <p className={FEATURE_SCAFFOLD_STYLES.taskMeta}>y Toast para feedback</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <div className={FEATURE_SCAFFOLD_STYLES.meta}>
        <Card className={FEATURE_SCAFFOLD_STYLES.statCard}>
          <p className={FEATURE_SCAFFOLD_STYLES.statValue}>{total}</p>
          <p className={FEATURE_SCAFFOLD_STYLES.statLabel}>Registros de prueba</p>
        </Card>
        <Card className={FEATURE_SCAFFOLD_STYLES.statCard}>
          <p className={FEATURE_SCAFFOLD_STYLES.statValue}>{page}</p>
          <p className={FEATURE_SCAFFOLD_STYLES.statLabel}>Pagina actual</p>
        </Card>
        <Card className={FEATURE_SCAFFOLD_STYLES.statCard}>
          <p className={FEATURE_SCAFFOLD_STYLES.statValue}>{pageSize}</p>
          <p className={FEATURE_SCAFFOLD_STYLES.statLabel}>Tamano de pagina</p>
        </Card>
      </div>

      <section className={FEATURE_SCAFFOLD_STYLES.heroGrid}>
        <div className={FEATURE_SCAFFOLD_STYLES.panelStack}>
          <Card subtitle="Tabla estandar ALMPES con paginacion" title="Listado">
            <div className={FEATURE_SCAFFOLD_STYLES.stateStack}>
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

        <div className={FEATURE_SCAFFOLD_STYLES.sideStack}>
          <Card subtitle="Estado operativo del modulo" title="Resumen">
            <div className={FEATURE_SCAFFOLD_STYLES.taskList}>
              <div className={FEATURE_SCAFFOLD_STYLES.taskItem}>
                <span aria-hidden="true" className={FEATURE_SCAFFOLD_STYLES.taskBullet} />
                <div>
                  <p className={FEATURE_SCAFFOLD_STYLES.taskTitle}>Integracion API pendiente</p>
                  <p className={FEATURE_SCAFFOLD_STYLES.taskMeta}>Conectar endpoint real del modulo</p>
                </div>
                <Badge variant="warning">Pendiente</Badge>
              </div>
              <div className={FEATURE_SCAFFOLD_STYLES.taskItem}>
                <span aria-hidden="true" className={FEATURE_SCAFFOLD_STYLES.taskBullet} />
                <div>
                  <p className={FEATURE_SCAFFOLD_STYLES.taskTitle}>Vista y tabla base listas</p>
                  <p className={FEATURE_SCAFFOLD_STYLES.taskMeta}>Componentes reutilizables operativos</p>
                </div>
                <Badge variant="success">Listo</Badge>
              </div>
              <div className={FEATURE_SCAFFOLD_STYLES.taskItem}>
                <span aria-hidden="true" className={FEATURE_SCAFFOLD_STYLES.taskBullet} />
                <div>
                  <p className={FEATURE_SCAFFOLD_STYLES.taskTitle}>Permisos y reglas por rol</p>
                  <p className={FEATURE_SCAFFOLD_STYLES.taskMeta}>Aplicar PermissionGate segun negocio</p>
                </div>
                <Badge variant="info">Siguiente</Badge>
              </div>
            </div>
          </Card>

          <Card subtitle="Estandares de desarrollo" title="Notas de UI">
            <div className="space-y-2">
              <p className={FEATURE_SCAFFOLD_STYLES.sectionText}>No agregar clases repetidas en paginas. Centralizar en tokens o componentes UI.</p>
              <p className={FEATURE_SCAFFOLD_STYLES.sectionText}>Todas las acciones de tabla deben usar variantes de Button del sistema.</p>
              <p className={FEATURE_SCAFFOLD_STYLES.sectionText}>Mantener colores ALMPES: vino para marca y plomo para estructura.</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default FeatureScaffoldPage;
