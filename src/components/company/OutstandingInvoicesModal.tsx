"use client";

import { useInvoices } from "@/hooks/invoices/useInvoices";
import { extractListRows } from "@/lib/api/extractApiData";
import { formatCurrency } from "@/lib/currency";
import type { Invoice } from "@/models/Invoice";

type OutstandingInvoicesModalProps = {
  show: boolean;
  onHide: () => void;
  tenantId: string | null | undefined;
  companyName: string;
  currency: string;
};

export function OutstandingInvoicesModal({
  show,
  onHide,
  tenantId,
  companyName,
  currency,
}: OutstandingInvoicesModalProps) {
  const listQuery = useInvoices(
    tenantId
      ? {
          tenant_id: tenantId,
          limit: 50,
          sort_field: "created_at",
          sort_direction: "desc",
        }
      : undefined,
    { enabled: show && !!tenantId?.trim() },
  );

  if (!show) return null;

  const { rows } = extractListRows<Invoice & Record<string, unknown>>(
    listQuery.data,
  );
  const unpaid = rows.filter((inv) => {
    const due =
      inv.amount_due ??
      inv.outstanding_amount ??
      (inv.total_amount != null && inv.paid_amount != null
        ? inv.total_amount - inv.paid_amount
        : null);
    return (due != null && due > 0) || inv.status === "pending" || inv.status === "partially_paid" || inv.status === "overdue";
  });

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="outstanding-invoices-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm dark:bg-black/60"
        aria-label="Close"
        onClick={onHide}
      />
      <div className="relative z-10 flex max-h-[min(90vh,640px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200/70 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2
                id="outstanding-invoices-title"
                className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
              >
                Outstanding invoices
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {companyName} · {currency}
              </p>
            </div>
            <button
              type="button"
              onClick={onHide}
              className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Close
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {listQuery.isPending ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
                />
              ))}
            </div>
          ) : listQuery.isError ? (
            <p className="text-sm text-rose-600">{String(listQuery.error)}</p>
          ) : unpaid.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No unpaid or partially paid invoices found for this tenant.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="py-2 pr-2">Invoice #</th>
                    <th className="py-2 pr-2">Status</th>
                    <th className="py-2 pr-2">Due</th>
                    <th className="py-2 text-right">Amount due</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaid.map((inv) => {
                    const dueAmt =
                      inv.amount_due ??
                      inv.outstanding_amount ??
                      (inv.total_amount != null && inv.paid_amount != null
                        ? inv.total_amount - inv.paid_amount
                        : inv.total_amount ?? 0);
                    return (
                      <tr
                        key={inv.id}
                        className="border-b border-zinc-100 dark:border-zinc-800"
                      >
                        <td className="py-2 pr-2 font-mono">
                          {inv.invoice_number}
                        </td>
                        <td className="py-2 pr-2 capitalize">{inv.status}</td>
                        <td className="py-2 pr-2 text-zinc-600">
                          {inv.due_date
                            ? new Date(inv.due_date).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="py-2 text-right font-mono">
                          {formatCurrency(
                            dueAmt,
                            inv.currency_code || currency,
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
