import { Button, Card, Input, Select } from "@/components/ui";
import { TABLE_OPTIONS } from "../constants/mantenimientoConstants";
import type { MaintenanceTableKey, TableMeta } from "../types/mantenimientoTypes";

type MantenimientoFiltersProps = {
  activeTable: MaintenanceTableKey;
  draftSearch: string;
  meta: TableMeta;
  onActiveTableChange: (value: MaintenanceTableKey) => void;
  onClear: () => void;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: "all" | "active") => void;
  statusFilter: "all" | "active";
};

export function MantenimientoFilters({ activeTable, draftSearch, meta, onActiveTableChange, onClear, onSearchChange, onStatusFilterChange, statusFilter }: MantenimientoFiltersProps): JSX.Element {
  return (
    <Card bodyClassName="pt-5" className="border-[#dbe6f3] bg-[linear-gradient(180deg,#ffffff,#fbfdff)]" subtitle="Administre catalogos base del sistema desde una sola vista" title="Mantenimiento de tablas">
      <div className="grid gap-3 lg:grid-cols-[70px_220px_92px_minmax(0,1fr)_72px_220px_auto] lg:items-center">
        <div className="text-sm font-semibold text-slate-800">Tablas</div>
        <div>
          <Select containerClassName="space-y-0" hideLabel label="Tablas" onChange={(event) => onActiveTableChange(event.target.value as MaintenanceTableKey)} options={TABLE_OPTIONS.map((option) => ({ label: option.label, value: option.value }))} value={activeTable} />
        </div>
        <div className="text-sm font-semibold text-slate-800">Buscador</div>
        <div className="min-w-0">
          <Input containerClassName="space-y-0" hideLabel label="Buscador" onChange={(event) => onSearchChange(event.target.value)} placeholder={meta.searchPlaceholder} value={draftSearch} />
        </div>
        <div className="text-sm font-semibold text-slate-800">Filtros</div>
        <div>
          <Select
            containerClassName="space-y-0"
            hideLabel
            label="Filtros"
            onChange={(event) => onStatusFilterChange(event.target.value as "all" | "active")}
            options={[{ label: "Solo activos", value: "active" }, { label: "Todos", value: "all" }]}
            value={statusFilter}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <Button onClick={onClear} variant="clear">Limpiar</Button>
        </div>
      </div>
    </Card>
  );
}
