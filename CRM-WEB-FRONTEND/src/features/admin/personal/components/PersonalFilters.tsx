import { FileSpreadsheet, Plus } from "lucide-react";
import { Button, Card, Input, Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui";

type PersonalFiltersProps = {
  areaId: string;
  areaOptions: SelectOption[];
  cargoId: string;
  cargoOptions: SelectOption[];
  estadoId: string;
  estadoOptions: SelectOption[];
  onAreaChange: (value: string) => void;
  onCargoChange: (value: string) => void;
  onClear: () => void;
  onCreate: () => void;
  onEstadoChange: (value: string) => void;
  onExport: () => void;
  onOnlyActiveChange: (value: boolean) => void;
  onSearchChange: (value: string) => void;
  onlyActive: boolean;
  search: string;
};

export function PersonalFilters({
  areaId,
  areaOptions,
  cargoId,
  cargoOptions,
  estadoId,
  estadoOptions,
  onAreaChange,
  onCargoChange,
  onClear,
  onCreate,
  onEstadoChange,
  onExport,
  onOnlyActiveChange,
  onSearchChange,
  onlyActive,
  search,
}: PersonalFiltersProps): JSX.Element {
  return (
    <Card subtitle="Administre el personal del sistema con filtros, creacion y edicion desde una sola vista." title="Personal">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          containerClassName="min-w-[220px] flex-1"
          label="Buscar"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Documento, nombre o usuario"
          value={search}
        />
        <Select
          containerClassName="min-w-[180px] flex-1"
          label="Estado"
          onChange={(event) => onOnlyActiveChange(event.target.value !== "all")}
          options={[{ label: "Solo activos", value: "active" }, { label: "Todos", value: "all" }]}
          value={onlyActive ? "active" : "all"}
        />
        <Select containerClassName="min-w-[180px] flex-1" label="Area" onChange={(event) => onAreaChange(event.target.value)} options={areaOptions} value={areaId} />
        <Select containerClassName="min-w-[180px] flex-1" label="Cargo" onChange={(event) => onCargoChange(event.target.value)} options={cargoOptions} value={cargoId} />
        <Select containerClassName="min-w-[180px] flex-1" label="Estado laboral" onChange={(event) => onEstadoChange(event.target.value)} options={estadoOptions} value={estadoId} />
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onClear} variant="clear">Limpiar</Button>
          <Button leftIcon={<FileSpreadsheet size={14} />} onClick={onExport} variant="export">Exportar</Button>
          <Button leftIcon={<Plus size={14} />} onClick={onCreate} variant="create">Nuevo personal</Button>
        </div>
      </div>
    </Card>
  );
}
