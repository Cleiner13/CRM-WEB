import { Card } from "@/components/ui";
import type { TableMeta } from "../types/mantenimientoTypes";

type MantenimientoSummaryProps = {
  meta: TableMeta;
  metrics: {
    active: number;
    inactive: number;
  };
};

export function MantenimientoSummary({ meta, metrics }: MantenimientoSummaryProps): JSX.Element {
  return (
    <Card bodyClassName="py-8" className="border-[#dbe6f3] bg-[linear-gradient(135deg,#f8fbff_0%,#eef5fd_55%,#e9f1fb_100%)] text-center">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/80 bg-white/80 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Tabla activa</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{meta.title}</p>
          <p className="mt-1 text-sm text-slate-500">{meta.badge}</p>
        </div>
        <div className="rounded-2xl border border-white/80 bg-white/80 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Registros activos</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{metrics.active}</p>
          <p className="mt-1 text-sm text-slate-500">Elementos vigentes para operacion</p>
        </div>
        <div className="rounded-2xl border border-white/80 bg-white/80 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Registros inactivos</p>
          <p className="mt-2 text-3xl font-semibold text-rose-600">{metrics.inactive}</p>
          <p className="mt-1 text-sm text-slate-500">Historial conservado sin borrar trazabilidad</p>
        </div>
      </div>
    </Card>
  );
}
