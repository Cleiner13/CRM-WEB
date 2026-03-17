import type { ReactNode } from "react";
import { TABLE_STYLES, cx } from "@/config/styles";

export type TableColumn<TRow> = {
  key: string;
  header: string;
  className?: string;
  render: (row: TRow) => ReactNode;
};

export type TableProps<TRow> = {
  columns: Array<TableColumn<TRow>>;
  rows: TRow[];
  getRowKey: (row: TRow, index: number) => string;
  emptyMessage?: string;
  className?: string;
};

export function Table<TRow>({
  className,
  columns,
  emptyMessage = "No hay registros para mostrar.",
  getRowKey,
  rows,
}: TableProps<TRow>): JSX.Element {
  return (
    <div className={cx(TABLE_STYLES.wrapper, className)}>
      <table className={TABLE_STYLES.table}>
        <thead>
          <tr className={TABLE_STYLES.headerRow}>
            {columns.map((column) => (
              <th className={TABLE_STYLES.headerCell} key={column.key} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className={TABLE_STYLES.bodyRow}>
              <td className={TABLE_STYLES.emptyCell} colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr className={TABLE_STYLES.bodyRow} key={getRowKey(row, rowIndex)}>
                {columns.map((column) => (
                  <td className={cx(TABLE_STYLES.bodyCell, column.className)} key={column.key}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
