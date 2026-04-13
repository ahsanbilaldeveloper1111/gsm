"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";
import { extractListRows } from "@/lib/api/extractApiData";
import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/models/Product";

const SORTABLE = ["name", "base_price", "created_at"] as const;

type ProductRow = Product & Record<string, unknown>;

function SortChevron({
  active,
  dir,
}: {
  active: boolean;
  dir: "asc" | "desc";
}) {
  if (!active) {
    return (
      <span className="ml-1 text-zinc-400 opacity-60" aria-hidden>
        ↕
      </span>
    );
  }
  return (
    <span className="ml-1 text-zinc-700 dark:text-zinc-200" aria-hidden>
      {dir === "asc" ? "↑" : "↓"}
    </span>
  );
}

function categoryLabel(p: ProductRow): string {
  const c = p.category;
  if (c == null) return "—";
  if (typeof c === "string") return c.trim() ? c : "—";
  if (typeof c === "object" && c !== null && "name" in c) {
    const n = (c as { name?: string }).name;
    return n?.trim() ? String(n) : "—";
  }
  return "—";
}

type ProductListTableProps = {
  query: UseQueryResult<ApiSuccessResponse<unknown>>;
  title?: string;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (column: string) => void;
  pagination: ApiPagination | undefined;
  onPageChange: (page: number) => void;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onCreate: () => void;
  /** Optional — e.g. open product-category CRUD. */
  onManageCategories?: () => void;
  showManageCategories?: boolean;
  onView: (product: ProductRow) => void;
  onEdit: (id: number | string) => void;
  onDelete: (id: number | string) => void;
};

export function ProductListTable({
  query,
  title = "Products",
  sortField,
  sortDir,
  onSort,
  pagination,
  onPageChange,
  canView,
  canCreate,
  canUpdate,
  canDelete,
  onCreate,
  onManageCategories,
  showManageCategories,
  onView,
  onEdit,
  onDelete,
}: ProductListTableProps) {
  if (query.isPending) {
    return (
      <div className="space-y-3 rounded-2xl border border-zinc-200/60 bg-white/50 p-4 dark:border-zinc-800/60 dark:bg-zinc-950/40">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded-md bg-gradient-to-r from-zinc-100 via-zinc-200/80 to-zinc-100 dark:from-zinc-800 dark:via-zinc-700/50 dark:to-zinc-800"
            style={{ width: `${100 - i * 12}%` }}
          />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div
        className="rounded-2xl border border-rose-200/90 bg-gradient-to-br from-rose-50 to-white p-5 text-sm text-rose-900 shadow-sm dark:border-rose-900/50 dark:from-rose-950/40 dark:to-zinc-950 dark:text-rose-100"
        role="alert"
      >
        <p className="font-semibold">Request failed</p>
        <p className="mt-2 font-mono text-xs opacity-90">{String(query.error)}</p>
      </div>
    );
  }

  const { rows } = extractListRows<ProductRow>(query.data);
  const products = rows;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {showManageCategories && onManageCategories ? (
            <button
              type="button"
              onClick={onManageCategories}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Manage categories
            </button>
          ) : null}
          {canCreate ? (
            <button
              type="button"
              onClick={onCreate}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              Add product
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/40">
        <div className="border-b border-zinc-200/60 bg-zinc-50/80 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
            {title}
          </span>
          {pagination ? (
            <span className="ml-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              Page {pagination.page} of {pagination.last_page} · {pagination.total}{" "}
              total
            </span>
          ) : (
            <span className="ml-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              {products.length} row{products.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b-2 border-zinc-300 bg-zinc-50/50 dark:border-zinc-600 dark:bg-zinc-900/30">
                {(SORTABLE as readonly string[]).map((col) => (
                  <th key={col} className="whitespace-nowrap px-3 py-2">
                    <button
                      type="button"
                      className="inline-flex items-center font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
                      onClick={() => onSort(col)}
                    >
                      {col === "base_price"
                        ? "Base price"
                        : col.replace(/_/g, " ")}
                      <SortChevron
                        active={sortField === col}
                        dir={sortDir}
                      />
                    </button>
                  </th>
                ))}
                <th className="whitespace-nowrap px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                  SKU
                </th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                  Category
                </th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                  Type
                </th>
                <th className="min-w-[10rem] whitespace-nowrap px-3 py-2 text-right font-semibold text-zinc-700 dark:text-zinc-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-sm text-zinc-500"
                  >
                    No products match these filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const cur =
                    typeof p.currency === "string" && p.currency.trim()
                      ? p.currency
                      : "USD";
                  const typeService =
                    p.is_service === true ||
                    String(
                      (p as Record<string, unknown>).is_service,
                    ).toLowerCase() === "true" ||
                    Number((p as Record<string, unknown>).is_service) === 1;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-zinc-200 odd:bg-white/40 even:bg-zinc-50/30 dark:border-zinc-700 dark:odd:bg-transparent dark:even:bg-zinc-900/20"
                    >
                      <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">
                        {p.name ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-zinc-800 dark:text-zinc-200">
                        {formatCurrency(p.base_price, cur)}
                      </td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="max-w-[10rem] truncate px-3 py-2 text-zinc-600 dark:text-zinc-400">
                        {p.sku?.trim() ? p.sku : "—"}
                      </td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                        {categoryLabel(p)}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            typeService
                              ? "rounded-md bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-900 dark:bg-sky-950/50 dark:text-sky-100"
                              : "rounded-md bg-zinc-200 px-2 py-0.5 text-[11px] font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100"
                          }
                        >
                          {typeService ? "Service" : "Product"}
                        </span>
                      </td>
                      <td className="min-w-[10rem] whitespace-nowrap px-3 py-2 text-right">
                        <div className="flex flex-nowrap items-center justify-end gap-1">
                          {canView ? (
                            <button
                              type="button"
                              onClick={() => onView(p)}
                              className="shrink-0 rounded-lg bg-sky-100 px-2 py-1 text-[11px] font-medium text-sky-900 hover:bg-sky-200 dark:bg-sky-950/50 dark:text-sky-100 dark:hover:bg-sky-900/40"
                            >
                              View
                            </button>
                          ) : null}
                          {canUpdate ? (
                            <button
                              type="button"
                              onClick={() => onEdit(p.id)}
                              className="shrink-0 rounded-lg bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-100 dark:hover:bg-emerald-900/50"
                            >
                              Edit
                            </button>
                          ) : null}
                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => onDelete(p.id)}
                              className="shrink-0 rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-medium text-rose-900 hover:bg-rose-200 dark:bg-rose-950/50 dark:text-rose-100 dark:hover:bg-rose-900/40"
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.last_page > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {pagination.page} / {pagination.last_page}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.last_page}
            onClick={() => onPageChange(pagination.page + 1)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
