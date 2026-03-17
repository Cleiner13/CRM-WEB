import { PAGE_SIZE_OPTIONS } from "@/config/constants";
import { PAGINATION_STYLES, cx } from "@/config/styles";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  className?: string;
};

export function Pagination({
  className,
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  total,
}: PaginationProps): JSX.Element {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(currentPage * pageSize, total);

  return (
    <div className={cx(PAGINATION_STYLES.container, className)}>
      <p className={PAGINATION_STYLES.summary}>{`Mostrando ${start}-${end} de ${total}`}</p>
      <div className={PAGINATION_STYLES.controls}>
        {onPageSizeChange ? (
          <div className="w-36">
            <Select
              aria-label="Cantidad por pagina"
              label=""
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              options={pageSizeOptions.map((value) => ({ label: String(value), value: String(value) }))}
              value={String(pageSize)}
            />
          </div>
        ) : null}
        <Button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} variant="paginacion">
          Anterior
        </Button>
        <span className={PAGINATION_STYLES.pageText}>{`Pagina ${currentPage} de ${totalPages}`}</span>
        <Button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} variant="paginacion">
          Siguiente
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
