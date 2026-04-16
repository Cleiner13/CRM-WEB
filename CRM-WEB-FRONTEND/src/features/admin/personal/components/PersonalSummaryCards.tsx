type PersonalSummaryCardsProps = {
  total: number;
  visibleActiveCount: number;
  visibleWithUserCount: number;
};

export function PersonalSummaryCards({ total, visibleActiveCount, visibleWithUserCount }: PersonalSummaryCardsProps): JSX.Element {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Registros filtrados</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{total}</p>
        <p className="mt-1 text-sm text-slate-500">Total del resultado actual.</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Activos en pagina</p>
        <p className="mt-2 text-3xl font-semibold text-emerald-600">{visibleActiveCount}</p>
        <p className="mt-1 text-sm text-slate-500">Personal laboralmente vigente en la pagina mostrada.</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Con acceso tecnico</p>
        <p className="mt-2 text-3xl font-semibold text-sky-600">{visibleWithUserCount}</p>
        <p className="mt-1 text-sm text-slate-500">Usuarios con acceso activo dentro del resultado visible.</p>
      </div>
    </section>
  );
}
