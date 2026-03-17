import { useEffect, useMemo, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";

export type UsePaginationParams<T> = {
  items: T[];
  initialPage?: number;
  initialPageSize?: number;
};

export type UsePaginationResult<T> = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  paginatedItems: T[];
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
};

export function usePagination<T>({
  initialPage = 1,
  initialPageSize = DEFAULT_PAGE_SIZE,
  items,
}: UsePaginationParams<T>): UsePaginationResult<T> {
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const normalizedPage = Math.min(Math.max(page, 1), totalPages);

  useEffect(() => {
    if (page !== normalizedPage) {
      setPageState(normalizedPage);
    }
  }, [normalizedPage, page]);

  const paginatedItems = useMemo(() => {
    const start = (normalizedPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, normalizedPage, pageSize]);

  return {
    page: normalizedPage,
    pageSize,
    total,
    totalPages,
    paginatedItems,
    setPage: (nextPage) => setPageState(Math.max(1, nextPage)),
    setPageSize: (nextPageSize) => setPageSizeState(Math.max(1, nextPageSize)),
  };
}
