import { Button, Card, Input, Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui";

type UsuariosFiltersProps = {
  areaId: string;
  areaOptions: SelectOption[];
  cargoId: string;
  cargoOptions: SelectOption[];
  onAreaChange: (value: string) => void;
  onCargoChange: (value: string) => void;
  onClear: () => void;
  onOnlyActiveChange: (value: boolean) => void;
  onOpenAreaPermissions: () => void;
  onRoleChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onlyActive: boolean;
  roleId: string;
  roleOptions: SelectOption[];
  search: string;
};

export function UsuariosFilters({
  areaId,
  areaOptions,
  cargoId,
  cargoOptions,
  onAreaChange,
  onCargoChange,
  onClear,
  onOnlyActiveChange,
  onOpenAreaPermissions,
  onRoleChange,
  onSearchChange,
  onlyActive,
  roleId,
  roleOptions,
  search,
}: UsuariosFiltersProps): JSX.Element {
  return (
    <Card
      actions={<Button onClick={onOpenAreaPermissions} variant="create">Permisos por area</Button>}
      bodyClassName="pt-5"
      className="border-[#dbe6f3] bg-[linear-gradient(180deg,#ffffff,#fbfdff)]"
      subtitle="Gestion de seguridad tecnica, reseteo de acceso y permisos efectivos."
      title="Usuarios"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-[1.6]">
          <div className="mb-1 text-sm font-semibold text-slate-800">Buscar</div>
          <Input containerClassName="space-y-0" hideLabel label="Buscar" onChange={(event) => onSearchChange(event.target.value)} placeholder="Documento, usuario o nombre" value={search} />
        </div>
        <div className="min-w-[160px] flex-1">
          <div className="mb-1 text-sm font-semibold text-slate-800">Estado</div>
          <Select containerClassName="space-y-0" hideLabel label="Estado" onChange={(event) => onOnlyActiveChange(event.target.value === "true")} options={[{ label: "Solo activos", value: "true" }, { label: "Todos", value: "false" }]} value={String(onlyActive)} />
        </div>
        <div className="min-w-[170px] flex-1">
          <div className="mb-1 text-sm font-semibold text-slate-800">Area</div>
          <Select containerClassName="space-y-0" hideLabel label="Area" onChange={(event) => onAreaChange(event.target.value)} options={areaOptions} value={areaId} />
        </div>
        <div className="min-w-[170px] flex-1">
          <div className="mb-1 text-sm font-semibold text-slate-800">Cargo</div>
          <Select containerClassName="space-y-0" hideLabel label="Cargo" onChange={(event) => onCargoChange(event.target.value)} options={cargoOptions} value={cargoId} />
        </div>
        <div className="min-w-[170px] flex-1">
          <div className="mb-1 text-sm font-semibold text-slate-800">Rol</div>
          <Select containerClassName="space-y-0" hideLabel label="Rol" onChange={(event) => onRoleChange(event.target.value)} options={roleOptions} value={roleId} />
        </div>
        <div className="flex shrink-0">
          <Button onClick={onClear} variant="clear">Limpiar</Button>
        </div>
      </div>
    </Card>
  );
}
