"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type ColumnDef<T> = {
  key: string;
  header: ReactNode;
  className?: string;
  render: (row: T, index: number) => ReactNode;
};

type PaginatedDataTableProps<T> = {
  columns: Array<ColumnDef<T>>;
  rows: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  minWidthClassName?: string;
  perPageOptions?: number[];
  initialPerPage?: number;
  getRowKey?: (row: T, index: number) => string;
  toolbar?: ReactNode;
  paginationMode?: "client" | "server";
  page?: number;
  totalPages?: number;
  totalRows?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
};

export function PaginatedDataTable<T>({
  columns,
  rows,
  isLoading = false,
  emptyMessage = "No records found",
  loadingMessage = "Loading...",
  minWidthClassName = "min-w-[48rem]",
  perPageOptions = [10, 25, 50, 100],
  initialPerPage = 10,
  getRowKey,
  toolbar,
  paginationMode = "client",
  page,
  totalPages,
  totalRows,
  perPage,
  onPageChange,
  onPerPageChange,
}: PaginatedDataTableProps<T>) {
  const [clientPage, setClientPage] = useState(1);
  const [clientPerPage, setClientPerPage] = useState(initialPerPage);
  const isServerMode = paginationMode === "server";

  const resolvedPerPage = isServerMode ? (perPage ?? initialPerPage) : clientPerPage;

  useEffect(() => {
    if (!isServerMode) {
      setClientPage(1);
    }
  }, [rows.length, resolvedPerPage, isServerMode]);

  const calculatedTotalRows = isServerMode ? (totalRows ?? rows.length) : rows.length;
  const calculatedTotalPages = isServerMode
    ? Math.max(1, totalPages ?? 1)
    : Math.max(1, Math.ceil(calculatedTotalRows / resolvedPerPage));
  const currentPage = isServerMode ? Math.max(1, page ?? 1) : clientPage;
  const safePage = Math.min(currentPage, calculatedTotalPages);

  const pagedRows = useMemo(() => {
    if (isServerMode) return rows;
    const start = (safePage - 1) * resolvedPerPage;
    return rows.slice(start, start + resolvedPerPage);
  }, [isServerMode, rows, resolvedPerPage, safePage]);

  const startRow = calculatedTotalRows === 0 ? 0 : (safePage - 1) * resolvedPerPage + 1;
  const endRow = isServerMode
    ? Math.min(startRow + rows.length - 1, calculatedTotalRows)
    : Math.min(safePage * resolvedPerPage, calculatedTotalRows);

  function handlePerPageChange(nextPerPage: number) {
    if (isServerMode) {
      onPerPageChange?.(nextPerPage);
      onPageChange?.(1);
      return;
    }
    setClientPerPage(nextPerPage);
  }

  function handlePrevPage() {
    const next = Math.max(1, safePage - 1);
    if (isServerMode) {
      onPageChange?.(next);
      return;
    }
    setClientPage(next);
  }

  function handleNextPage() {
    const next = Math.min(calculatedTotalPages, safePage + 1);
    if (isServerMode) {
      onPageChange?.(next);
      return;
    }
    setClientPage(next);
  }

  return (
    <div className="space-y-3">
      {toolbar ? <div>{toolbar}</div> : null}
      <div className="overflow-x-auto">
        <table className={`w-full text-left text-sm ${minWidthClassName}`}>
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-300">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`px-3 py-2 ${column.className ?? ""}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-zinc-500">
                  {loadingMessage}
                </td>
              </tr>
            ) : pagedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-zinc-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pagedRows.map((row, index) => (
                <tr
                  key={getRowKey?.(row, index) ?? String(index)}
                  className="border-t border-zinc-200 dark:border-zinc-800"
                >
                  {columns.map((column) => (
                    <td key={column.key} className={`px-3 py-2 ${column.className ?? ""}`}>
                      {column.render(row, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 px-3 pb-3 pt-1 text-sm text-zinc-600 md:flex-row md:items-center md:justify-between dark:text-zinc-300">
        <div>
          Showing {startRow}-{endRow} of {calculatedTotalRows}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="per-page" className="text-xs uppercase tracking-wide">
            Per page
          </label>
          <select
            id="per-page"
            value={String(resolvedPerPage)}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {perPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={safePage <= 1}
            className="rounded border border-zinc-300 px-2 py-1 disabled:opacity-50 dark:border-zinc-700"
          >
            Prev
          </button>
          <span className="min-w-16 text-center text-xs uppercase tracking-wide">
            Page {safePage}/{calculatedTotalPages}
          </span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={safePage >= calculatedTotalPages}
            className="rounded border border-zinc-300 px-2 py-1 disabled:opacity-50 dark:border-zinc-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
