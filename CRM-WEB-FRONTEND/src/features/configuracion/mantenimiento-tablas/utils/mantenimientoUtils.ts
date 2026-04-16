import type { CatalogRow } from "../types/mantenimientoTypes";

export function getStatusVariant(active: boolean): "success" | "danger" {
  return active ? "success" : "danger";
}

export function getRowId(row: CatalogRow): number {
  if ("tablaMaestraId" in row) return row.tablaMaestraId;
  if ("permisoId" in row) return row.permisoId;
  return "rolId" in row ? row.rolId : row.moduloId;
}

export function buildCsv(rows: CatalogRow[]): string {
  const escape = (value: string | number | boolean | null | undefined): string =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const lines = [
    ["Id", "Codigo", "Nombre", "Descripcion", "Activo"].join(","),
    ...rows.map((row) =>
      [
        escape(getRowId(row)),
        escape(row.codigo),
        escape(row.nombre),
        escape(row.descripcion),
        escape(row.activo ? "Activo" : "Inactivo"),
      ].join(","),
    ),
  ];

  return lines.join("\n");
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function getMetrics(rows: Array<{ activo: boolean }>) {
  return {
    total: rows.length,
    active: rows.filter((row) => row.activo).length,
    inactive: rows.filter((row) => !row.activo).length,
  };
}
