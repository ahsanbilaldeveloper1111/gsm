"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

/** Page numbers with ellipsis gaps for long ranges (e.g. `1 … 4 5 6 … 20`). */
function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 1) return [1];
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

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
  const endRow =
    calculatedTotalRows === 0
      ? 0
      : isServerMode
        ? rows.length === 0
          ? 0
          : Math.min(startRow + rows.length - 1, calculatedTotalRows)
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

  function goToPage(next: number) {
    const p = Math.max(1, Math.min(calculatedTotalPages, next));
    if (isServerMode) {
      onPageChange?.(p);
      return;
    }
    setClientPage(p);
  }

  const pageItems = useMemo(
    () => getPaginationItems(safePage, calculatedTotalPages),
    [safePage, calculatedTotalPages],
  );

  return (
    <div className="space-y-3">
      {toolbar ? <div>{toolbar}</div> : null}
      <div className="overflow-x-auto rounded-b-xl">
        <table className={`w-full border-collapse text-left text-sm ${minWidthClassName}`}>
          <thead className="border-b border-zinc-200/90 bg-zinc-50/95 text-[11px] font-semibold tracking-wide text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-300">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`whitespace-nowrap px-4 py-3.5 first:pl-5 last:pr-5 ${column.className ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-zinc-500">
                  {loadingMessage}
                </td>
              </tr>
            ) : pagedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-zinc-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pagedRows.map((row, index) => (
                <tr
                  key={getRowKey?.(row, index) ?? String(index)}
                  className="transition-colors hover:bg-zinc-50/90 dark:hover:bg-zinc-900/50"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`align-middle px-4 py-3.5 text-zinc-800 first:pl-5 last:pr-5 dark:text-zinc-200 ${column.className ?? ""}`}
                    >
                      {column.render(row, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-100 px-4 py-3.5 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:text-zinc-300">
        <div className="text-[13px] tabular-nums text-zinc-500 dark:text-zinc-400">
          Showing <span className="font-medium text-zinc-700 dark:text-zinc-200">{startRow}</span>–
          <span className="font-medium text-zinc-700 dark:text-zinc-200">{endRow}</span> of{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-200">{calculatedTotalRows}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="per-page" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Rows per page
          </label>
          <select
            id="per-page"
            value={String(resolvedPerPage)}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {perPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div
            className="ml-1 flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50/80 p-1 dark:border-zinc-700 dark:bg-zinc-900/50"
            role="navigation"
            aria-label="Table pagination"
          >
            <button
              type="button"
              onClick={() => goToPage(1)}
              disabled={safePage <= 1}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-zinc-700 transition enabled:hover:bg-white enabled:hover:shadow-sm disabled:opacity-40 dark:text-zinc-200 enabled:dark:hover:bg-zinc-800"
              title="First page"
            >
              First
            </button>
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={safePage <= 1}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-zinc-700 transition enabled:hover:bg-white enabled:hover:shadow-sm disabled:opacity-40 dark:text-zinc-200 enabled:dark:hover:bg-zinc-800"
              title="Previous page"
            >
              Prev
            </button>
            <div className="flex items-center gap-0.5 px-0.5">
              {pageItems.map((item, idx) =>
                item === "ellipsis" ? (
                  <span
                    key={`e-${idx}`}
                    className="flex min-w-[1.75rem] items-center justify-center px-1 text-xs font-medium text-zinc-400 select-none dark:text-zinc-500"
                    aria-hidden
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => goToPage(item)}
                    title={`Page ${item}`}
                    className={`min-w-[2rem] rounded-md px-2 py-1.5 text-xs font-medium tabular-nums transition ${
                      item === safePage
                        ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-600"
                        : "text-zinc-700 hover:bg-white hover:shadow-sm dark:text-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={safePage >= calculatedTotalPages}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-zinc-700 transition enabled:hover:bg-white enabled:hover:shadow-sm disabled:opacity-40 dark:text-zinc-200 enabled:dark:hover:bg-zinc-800"
              title="Next page"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => goToPage(calculatedTotalPages)}
              disabled={safePage >= calculatedTotalPages}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-zinc-700 transition enabled:hover:bg-white enabled:hover:shadow-sm disabled:opacity-40 dark:text-zinc-200 enabled:dark:hover:bg-zinc-800"
              title="Last page"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
