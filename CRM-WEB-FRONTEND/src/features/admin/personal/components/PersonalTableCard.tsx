import { Card, Pagination, Table } from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import type { EmpleadoListItem } from "@/types";

type PersonalTableCardProps = {
  columns: Array<TableColumn<EmpleadoListItem>>;
  employees: EmpleadoListItem[];
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  page: number;
  pageSize: number;
  total: number;
};

export function PersonalTableCard({
  columns,
  employees,
  loading,
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  total,
}: PersonalTableCardProps): JSX.Element {
  return (
    <Card subtitle={loading ? "Cargando informacion del personal..." : `${total} registros encontrados.`} title="Listado de personal">
      <div className="space-y-4">
        <Table columns={columns} emptyMessage={loading ? "Cargando personal..." : "No hay personal para mostrar."} getRowKey={(row) => String(row.empleadoId)} rows={employees} />
        <Pagination onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} page={page} pageSize={pageSize} total={total} />
      </div>
    </Card>
  );
}
