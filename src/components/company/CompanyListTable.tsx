"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";
import { extractListRows } from "@/lib/api/extractApiData";
import { useMainAppResellerNameMap } from "@/hooks/resellers/useMainAppResellerNameMap";
import type { Company } from "@/models/Company";

/** Column order matches body cells: name, credit, country, outstanding, email, created. */
const SORTABLE = [
  "name",
  "credit_limit",
  "country",
  "outstanding_amount",
  "email",
  "created_at",
] as const;

type CompanyRow = Company & Record<string, unknown>;

type CompanyListTableProps = {
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
  onView: (row: Company) => void;
  onEdit: (row: Company) => void;
  onDelete: (row: Company) => void;
  onProductPricing: (row: Company) => void;
};

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

function formatMoney(amount: number | undefined, currency: string): string {
  const c = currency || "USD";
  const n = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${c} ${n.toFixed(2)}`;
  }
}

function displayName(
  c: CompanyRow,
  resellerNameByTenantId: Record<string, string>,
): string {
  const direct = c.name && String(c.name).trim();
  if (direct) return direct;
  const tid =
    c.tenant_id != null && String(c.tenant_id).trim() !== ""
      ? String(c.tenant_id).trim()
      : "";
  if (tid && resellerNameByTenantId[tid]) {
    return resellerNameByTenantId[tid];
  }
  return tid || "—";
}

function vendorLabel(c: CompanyRow): string {
  if (c.vendor?.name) return String(c.vendor.name);
  if (c.reseller?.name) return String(c.reseller.name);
  if (c.reseller?.tenant_id)
    return String(c.reseller.tenant_id);
  return "—";
}

export function CompanyListTable({
  query,
  title = "Tenants",
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
  onView,
  onEdit,
  onDelete,
  onProductPricing,
}: CompanyListTableProps) {
  const mainAppResellerNameMap = useMainAppResellerNameMap();

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

  const { rows } = extractListRows<CompanyRow>(query.data);
  const companies = rows;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {canCreate ? (
          <button
            type="button"
            onClick={onCreate}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
          >
            Create tenant
          </button>
        ) : (
          <span />
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/40">
        <div className="border-b border-zinc-200/60 bg-zinc-50/80 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
            {title}
          </span>
          {pagination ? (
            <span className="ml-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              Page {pagination.page} of {pagination.last_page} ·{" "}
              {pagination.total} total
            </span>
          ) : (
            <span className="ml-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              {companies.length} row{companies.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b-2 border-zinc-300 bg-zinc-50/50 dark:border-zinc-600 dark:bg-zinc-900/30">
                {(SORTABLE as readonly string[]).map((col) => (
                  <th key={col} className="whitespace-nowrap px-3 py-2">
                    <button
                      type="button"
                      className="inline-flex items-center font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
                      onClick={() => onSort(col)}
                    >
                      {col === "credit_limit"
                        ? "Credit limit"
                        : col === "outstanding_amount"
                          ? "Outstanding"
                          : col.replace(/_/g, " ")}
                      <SortChevron
                        active={sortField === col}
                        dir={sortDir}
                      />
                    </button>
                  </th>
                ))}
                <th className="whitespace-nowrap px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                  Vendor
                </th>
                <th className="min-w-[11rem] whitespace-nowrap px-3 py-2 text-right font-semibold text-zinc-700 dark:text-zinc-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-8 text-center text-sm text-zinc-500"
                  >
                    No companies match these filters.
                  </td>
                </tr>
              ) : (
                companies.map((c, idx) => {
                  const cur = c.profile?.currency ?? "USD";
                  const credit =
                    c.profile?.credit_limit != null &&
                    c.profile.credit_limit > 0
                      ? formatMoney(c.profile.credit_limit, cur)
                      : null;
                  const outstanding = formatMoney(
                    c.profile?.outstanding_amount ?? 0,
                    cur,
                  );
                  const phone =
                    c.phone != null
                      ? String(c.phone)
                      : c.phone_no != null
                        ? String(c.phone_no)
                        : null;
                  return (
                    <tr
                      key={c.id ?? c.tenant_id ?? idx}
                      className="border-b border-zinc-200 odd:bg-white/40 even:bg-zinc-50/30 dark:border-zinc-700 dark:odd:bg-transparent dark:even:bg-zinc-900/20"
                    >
                      <td className="px-3 py-2">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {displayName(c, mainAppResellerNameMap)}
                        </div>
                        {phone ? (
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {phone}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-zinc-800 dark:text-zinc-200">
                        {credit ?? (
                          <span className="text-zinc-400">Not set</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                        {c.country ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-zinc-800 dark:text-zinc-200">
                        {outstanding}
                      </td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                        {c.email ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                        {vendorLabel(c)}
                      </td>
                      <td className="min-w-[11rem] whitespace-nowrap px-3 py-2 text-right">
                        <div className="flex flex-nowrap items-center justify-end gap-1">
                          {canView ? (
                            <button
                              type="button"
                              onClick={() => onView(c)}
                              className="shrink-0 rounded-lg bg-sky-100 px-2 py-1 text-[11px] font-medium text-sky-900 hover:bg-sky-200 dark:bg-sky-950/50 dark:text-sky-100 dark:hover:bg-sky-900/40"
                            >
                              View
                            </button>
                          ) : null}
                          {canUpdate ? (
                            <button
                              type="button"
                              onClick={() => onEdit(c)}
                              className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-950 hover:bg-amber-200 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:bg-amber-900/40"
                            >
                              Edit
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => onProductPricing(c)}
                            className="shrink-0 rounded-lg bg-violet-100 px-2 py-1 text-[11px] font-medium text-violet-900 hover:bg-violet-200 dark:bg-violet-950/50 dark:text-violet-100 dark:hover:bg-violet-900/40"
                            title="Open product pricing (new tab)"
                          >
                            Pricing
                          </button>
                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => onDelete(c)}
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

      <details className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80">
        <summary className="cursor-pointer px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Raw API response
        </summary>
        <pre className="max-h-[min(40vh,320px)] overflow-auto border-t border-zinc-200/60 p-4 font-mono text-[11px] leading-relaxed text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
          {query.data === undefined || query.data === null
            ? "—"
            : JSON.stringify(query.data, null, 2)}
        </pre>
      </details>
    </div>
  );
}
