import { Card, Pagination, Table } from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import type { UsuarioListItem } from "@/types";

type UsuariosTableCardProps = {
  columns: Array<TableColumn<UsuarioListItem>>;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  page: number;
  pageSize: number;
  total: number;
  users: UsuarioListItem[];
};

export function UsuariosTableCard({ columns, loading, onPageChange, onPageSizeChange, page, pageSize, total, users }: UsuariosTableCardProps): JSX.Element {
  return (
    <Card bodyClassName="pt-5" className="border-[#dbe6f3] bg-[linear-gradient(180deg,#ffffff,#fbfdff)]" subtitle="Acciones centrales sobre cada usuario del sistema." title="Tabla de usuarios">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">{loading ? "Cargando usuarios..." : `${total} registros encontrados.`}</p>
        <Table columns={columns} emptyMessage="No hay usuarios para mostrar." getRowKey={(row) => String(row.usuarioId)} rows={users} />
        <Pagination onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} page={page} pageSize={pageSize} total={total} />
      </div>
    </Card>
  );
}
