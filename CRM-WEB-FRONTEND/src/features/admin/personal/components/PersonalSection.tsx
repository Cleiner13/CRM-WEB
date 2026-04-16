import type { ReactNode } from "react";

type PersonalSectionProps = {
  children: ReactNode;
  subtitle?: string;
  title: string;
};

export function PersonalSection({ children, subtitle, title }: PersonalSectionProps): JSX.Element {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
