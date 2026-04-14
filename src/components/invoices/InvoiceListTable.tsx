"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";
import { extractListRows } from "@/lib/api/extractApiData";
import type { Invoice, InvoiceStatus } from "@/models/Invoice";

function formatMoney(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
}

function formatShortDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function invoiceProcessingFeeTotal(inv: Invoice): number {
  return (inv.payments ?? []).reduce(
    (sum, p) => sum + (Number(p.processing_fee) || 0),
    0,
  );
}

function invoiceAmountDue(inv: Invoice): number {
  return (
    inv.amount_due ??
    inv.outstanding_amount ??
    Math.max(0, (inv.total_amount ?? 0) - (inv.paid_amount ?? 0))
  );
}

function isOverdue(
  dueDate: string | null | undefined,
  status: string,
  outstanding: number,
): boolean {
  if (status === "paid" || status === "cancelled") return false;
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  if (due.getTime() >= today.getTime()) return false;
  return outstanding > 0;
}

function statusBadgeClasses(status: InvoiceStatus | string): string {
  const map: Record<string, string> = {
    draft: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100",
    sent: "bg-sky-200 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100",
    paid: "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100",
    overdue: "bg-rose-200 text-rose-900 dark:bg-rose-900/50 dark:text-rose-100",
    cancelled: "bg-zinc-600 text-white",
    pending: "bg-amber-200 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
    partially_paid:
      "bg-amber-200 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  };
  return map[status] ?? "bg-zinc-200 text-zinc-800 dark:bg-zinc-700";
}

function billToLabel(
  inv: Invoice,
  tenantDisplayNameById: Record<string, string>,
  crmCompanyNameById: Record<string, string>,
): string {
  const customerName = inv.customer?.name ?? inv.customer?.email;
  if (customerName) return String(customerName);
  const crmId =
    inv.crm_company_id != null && String(inv.crm_company_id).trim() !== ""
      ? String(inv.crm_company_id).trim()
      : "";
  if (crmId && crmCompanyNameById[crmId]?.trim()) return crmCompanyNameById[crmId];
  if (inv.company?.name) return inv.company.name;
  const tid =
    inv.tenant_id != null && String(inv.tenant_id).trim() !== ""
      ? String(inv.tenant_id).trim()
      : "";
  if (tid && tenantDisplayNameById[tid]?.trim()) return tenantDisplayNameById[tid];
  return tid || "—";
}

type InvoiceListTableProps = {
  query: UseQueryResult<ApiSuccessResponse<unknown>>;
  title?: string;
  displayCurrencyCode: string;
  isSuperAdmin: boolean;
  onCreate?: () => void;
  onView: (id: number | string) => void;
  onEdit: (id: number | string) => void;
  onDelete: (id: number | string) => void;
  pagination: ApiPagination | undefined;
  onPageChange: (page: number) => void;
  tenantDisplayNameById?: Record<string, string>;
  crmCompanyNameById?: Record<string, string>;
};

export function InvoiceListTable({
  query,
  title = "Invoices",
  displayCurrencyCode,
  isSuperAdmin,
  onCreate,
  onView,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
  tenantDisplayNameById = {},
  crmCompanyNameById = {},
}: InvoiceListTableProps) {
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

  // TanStack Query v5: disabled queries stay `isPending` without fetching — use
  // `isLoading` / `isPaused` so we don't show a perpetual skeleton (e.g. JWT not ready yet).
  if (query.isLoading || query.isPaused) {
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

  const { rows } = extractListRows<Record<string, unknown>>(query.data);
  const invoices = rows as unknown as Invoice[];

  const fmt = (amount: number, code?: string) => {
    const c =
      displayCurrencyCode.trim() || code || "USD";
    return formatMoney(amount, c);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {onCreate ? (
          <button
            type="button"
            onClick={onCreate}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
          >
            Create invoice
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
              {invoices.length} row{invoices.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b-2 border-zinc-300 bg-zinc-50/50 dark:border-zinc-600 dark:bg-zinc-900/30">
                <th className="whitespace-nowrap px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                  Invoice #
                </th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                  PO #
                </th>
                {isSuperAdmin ? (
                  <th className="whitespace-nowrap px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                    Type
                  </th>
                ) : null}
                <th className="whitespace-nowrap px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                  Bill to
                </th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                  Invoice date
                </th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                  Due
                </th>
                <th className="whitespace-nowrap px-3 py-2 text-right font-semibold text-zinc-700 dark:text-zinc-200">
                  Total
                </th>
                <th className="whitespace-nowrap px-3 py-2 text-right font-semibold text-zinc-700 dark:text-zinc-200">
                  Fees
                </th>
                <th className="whitespace-nowrap px-3 py-2 text-right font-semibold text-zinc-700 dark:text-zinc-200">
                  Due amt
                </th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                  Status
                </th>
                <th className="min-w-[11rem] whitespace-nowrap px-3 py-2 text-right font-semibold text-zinc-700 dark:text-zinc-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 11 : 10}
                    className="px-3 py-8 text-center text-sm text-zinc-500"
                  >
                    No invoices match these filters.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const dueAmt = invoiceAmountDue(inv);
                  const outstanding =
                    inv.outstanding_amount ??
                    (inv.total_amount ?? 0) - (inv.paid_amount ?? 0);
                  const overdue =
                    isOverdue(
                      inv.due_date,
                      inv.status,
                      outstanding,
                    ) && inv.status !== "overdue";
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-zinc-200 odd:bg-white/40 even:bg-zinc-50/30 dark:border-zinc-700 dark:odd:bg-transparent dark:even:bg-zinc-900/20"
                    >
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="font-mono text-left text-sky-700 underline decoration-sky-400/60 hover:text-sky-600 dark:text-sky-400"
                          onClick={() => onView(inv.id)}
                        >
                          {inv.invoice_number}
                        </button>
                      </td>
                      <td className="max-w-[8rem] truncate px-3 py-2 text-zinc-500">
                        {inv.po_number || "—"}
                      </td>
                      {isSuperAdmin ? (
                        <td className="px-3 py-2">
                          {inv.crm_company_id ? (
                            <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-sky-900 dark:bg-sky-900/40 dark:text-sky-100">
                              Customer
                            </span>
                          ) : (
                            <span className="rounded-md bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                              Tenant
                            </span>
                          )}
                        </td>
                      ) : null}
                      <td
                        className="max-w-[12rem] truncate px-3 py-2 text-zinc-800 dark:text-zinc-200"
                        title={billToLabel(
                          inv,
                          tenantDisplayNameById,
                          crmCompanyNameById,
                        )}
                      >
                        {billToLabel(
                          inv,
                          tenantDisplayNameById,
                          crmCompanyNameById,
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        {formatShortDate(inv.invoice_date)}
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-2 ${overdue ? "font-semibold text-rose-600 dark:text-rose-400" : ""}`}
                      >
                        {formatShortDate(inv.due_date)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right font-mono">
                        {fmt(inv.total_amount, inv.currency_code)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-zinc-600">
                        {fmt(
                          invoiceProcessingFeeTotal(inv),
                          inv.currency_code,
                        )}
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-2 text-right font-mono ${dueAmt > 0 ? "font-semibold text-amber-700 dark:text-amber-400" : ""}`}
                      >
                        {fmt(dueAmt, inv.currency_code)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap items-center gap-1">
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize ${statusBadgeClasses(inv.status)}`}
                          >
                            {String(inv.status).replace(/_/g, " ")}
                          </span>
                          {overdue ? (
                            <span className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              Overdue
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="min-w-[11rem] whitespace-nowrap px-3 py-2 text-right align-middle">
                        <div className="flex flex-nowrap items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onView(inv.id)}
                            className="shrink-0 rounded-lg bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(inv.id)}
                            className="shrink-0 rounded-lg bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-100 dark:hover:bg-emerald-900/50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={inv.status === "paid"}
                            title={
                              inv.status === "paid"
                                ? "Cannot delete a paid invoice"
                                : "Delete"
                            }
                            onClick={() => onDelete(inv.id)}
                            className="shrink-0 rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-medium text-rose-900 hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-rose-950/50 dark:text-rose-100 dark:hover:bg-rose-900/40"
                          >
                            Delete
                          </button>
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
