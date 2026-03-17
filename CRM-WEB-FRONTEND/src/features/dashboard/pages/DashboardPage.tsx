import { useMemo } from "react";
import { DollarSign, Star, Users } from "lucide-react";
import { DASHBOARD_STYLES } from "@/config/styles";
import { PageHeader } from "@/components/layout";
import { Badge, Button, Card, Pagination, Table } from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import { usePagination } from "@/hooks";

type CampaignRow = {
  id: string;
  producto: string;
  campania: string;
  estado: "Activa" | "Pausada" | "Finalizada";
  ingreso: string;
};

const KPI_ITEMS = [
  {
    id: "rating",
    label: "Calificacion promedio del cliente",
    value: "7.8/10",
    delta: "+20%",
    positive: true,
    icon: Star,
  },
  {
    id: "followers",
    label: "Seguidores de canales",
    value: "5,934",
    delta: "-3.5%",
    positive: false,
    icon: Users,
  },
  {
    id: "income",
    label: "Ingresos totales",
    value: "$9,758",
    delta: "+15%",
    positive: true,
    icon: DollarSign,
  },
] as const;

const CAMPAIGNS: CampaignRow[] = [
  { id: "1", producto: "OH TC", campania: "Campana Invierno", estado: "Activa", ingreso: "S/ 12,300" },
  { id: "2", producto: "Santander TC", campania: "Conversion Digital", estado: "Activa", ingreso: "S/ 9,420" },
  { id: "3", producto: "Cencosud LD", campania: "Recuperacion", estado: "Pausada", ingreso: "S/ 4,180" },
  { id: "4", producto: "OH MAX", campania: "Cross Sell", estado: "Activa", ingreso: "S/ 8,910" },
  { id: "5", producto: "OH PLD", campania: "Prospeccion", estado: "Finalizada", ingreso: "S/ 6,250" },
  { id: "6", producto: "Cencosud TC", campania: "Base Fria", estado: "Activa", ingreso: "S/ 7,840" },
] as const;

function estadoVariant(estado: CampaignRow["estado"]): "success" | "warning" | "neutral" {
  if (estado === "Activa") {
    return "success";
  }

  if (estado === "Pausada") {
    return "warning";
  }

  return "neutral";
}

export function DashboardPage(): JSX.Element {
  const { page, pageSize, paginatedItems, setPage, setPageSize, total } = usePagination({ items: CAMPAIGNS });

  const columns = useMemo<Array<TableColumn<CampaignRow>>>(
    () => [
      { key: "producto", header: "Productos", render: (row) => row.producto },
      { key: "campania", header: "Campana", render: (row) => row.campania },
      {
        key: "estado",
        header: "Estado",
        render: (row) => <Badge variant={estadoVariant(row.estado)}>{row.estado}</Badge>,
      },
      { key: "ingreso", header: "Ingreso", render: (row) => row.ingreso },
    ],
    [],
  );

  return (
    <div className={DASHBOARD_STYLES.page}>
      <PageHeader
        actions={
          <>
            <Button variant="search">Buscar</Button>
            <Button variant="export">Exportar</Button>
          </>
        }
        subtitle="Vista general del rendimiento comercial y seguimiento operativo"
        tag="Dashboard"
        title="Panel principal"
      />

      <section className={DASHBOARD_STYLES.kpiGrid}>
        {KPI_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div className={DASHBOARD_STYLES.kpiCard} key={item.id}>
              <span className={DASHBOARD_STYLES.kpiIcon}>
                <Icon size={18} />
              </span>
              <p className={DASHBOARD_STYLES.kpiLabel}>{item.label}</p>
              <p className={DASHBOARD_STYLES.kpiValue}>{item.value}</p>
              <div className={DASHBOARD_STYLES.kpiDeltaRow}>
                <span className={item.positive ? DASHBOARD_STYLES.kpiDeltaPositive : DASHBOARD_STYLES.kpiDeltaNegative}>
                  {item.delta}
                </span>
                <span className={DASHBOARD_STYLES.kpiDeltaText}>Vs el mes pasado</span>
              </div>
            </div>
          );
        })}
      </section>

      <section className={DASHBOARD_STYLES.gridMain}>
        <div className={DASHBOARD_STYLES.panel}>
          <div className={DASHBOARD_STYLES.panelHeader}>
            <div>
              <h2 className={DASHBOARD_STYLES.panelTitle}>Impresion y trafico de datos</h2>
              <p className={DASHBOARD_STYLES.panelSubtitle}>1 de junio de 2024 - 1 de diciembre de 2025</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-slate-900">$9,758.00</p>
              <p className="text-sm text-slate-500">Ingresos totales</p>
            </div>
          </div>
          <div className={DASHBOARD_STYLES.chartCanvas}>
            <div className={DASHBOARD_STYLES.chartGrid}>
              <div className={DASHBOARD_STYLES.chartLines}>
                <div className={DASHBOARD_STYLES.chartShade} />
                <div className={DASHBOARD_STYLES.chartLineA} />
                <div className={DASHBOARD_STYLES.chartLineB} />
              </div>
              <div className={DASHBOARD_STYLES.chartMonths}>
                <span>Ene</span>
                <span>Feb</span>
                <span>Mar</span>
              </div>
            </div>
          </div>
        </div>

        <div className={DASHBOARD_STYLES.panel}>
          <div className={DASHBOARD_STYLES.panelHeader}>
            <div>
              <h2 className={DASHBOARD_STYLES.panelTitle}>Estadisticas de trafico</h2>
              <p className={DASHBOARD_STYLES.panelSubtitle}>Mensual</p>
            </div>
            <Button size="sm" variant="clear">
              Ver mas
            </Button>
          </div>
          <div className={DASHBOARD_STYLES.trafficList}>
            <div className={DASHBOARD_STYLES.trafficItem}>
              <p className={DASHBOARD_STYLES.trafficLabel}>Nuevos suscriptores</p>
              <p className={DASHBOARD_STYLES.trafficValue}>567 mil</p>
              <div className={DASHBOARD_STYLES.trafficMeta}>
                <span className="text-emerald-600 font-semibold">+3.85%</span>
                <span className="text-slate-500">Luego de la semana pasada</span>
              </div>
              <div className={DASHBOARD_STYLES.miniSpark} />
            </div>
            <div className={DASHBOARD_STYLES.trafficItem}>
              <p className={DASHBOARD_STYLES.trafficLabel}>Tasa de conversion</p>
              <p className={DASHBOARD_STYLES.trafficValue}>276 mil</p>
              <div className={DASHBOARD_STYLES.trafficMeta}>
                <span className="text-rose-600 font-semibold">-5.39%</span>
                <span className="text-slate-500">Luego de la semana pasada</span>
              </div>
              <div className={DASHBOARD_STYLES.miniSpark} />
            </div>
            <div className={DASHBOARD_STYLES.trafficItem}>
              <p className={DASHBOARD_STYLES.trafficLabel}>Tasa de rebote de pagina</p>
              <p className={DASHBOARD_STYLES.trafficValue}>285</p>
              <div className={DASHBOARD_STYLES.trafficMeta}>
                <span className="text-emerald-600 font-semibold">+12.74%</span>
                <span className="text-slate-500">Luego de la semana pasada</span>
              </div>
              <div className={DASHBOARD_STYLES.miniSpark} />
            </div>
          </div>
        </div>
      </section>

      <section className={DASHBOARD_STYLES.bottomGrid}>
        <Card subtitle="Tabla estandar con paginacion" title="Campanas destacadas">
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

        <Card subtitle="Resumen rapido de canales" title="Principal fuente de trafico">
          <div className={DASHBOARD_STYLES.listStack}>
            <div className={DASHBOARD_STYLES.noteItem}>
              <p className={DASHBOARD_STYLES.noteTitle}>Campanas digitales</p>
              <p className={DASHBOARD_STYLES.noteMeta}>48% del trafico mensual consolidado</p>
            </div>
            <div className={DASHBOARD_STYLES.noteItem}>
              <p className={DASHBOARD_STYLES.noteTitle}>Referidos internos</p>
              <p className={DASHBOARD_STYLES.noteMeta}>31% con mejor tasa de conversion</p>
            </div>
            <div className={DASHBOARD_STYLES.noteItem}>
              <p className={DASHBOARD_STYLES.noteTitle}>Bases historicas</p>
              <p className={DASHBOARD_STYLES.noteMeta}>21% de aporte estable en back office</p>
            </div>
            <div className={DASHBOARD_STYLES.noteItem}>
              <p className={DASHBOARD_STYLES.noteTitle}>Observacion</p>
              <p className={DASHBOARD_STYLES.noteMeta}>Priorizar campanas con mejor retorno en OH TC y Santander TC.</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default DashboardPage;
