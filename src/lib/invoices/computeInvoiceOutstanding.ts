import type { Invoice } from "@/models/Invoice";

/**
 * Outstanding balance for payment UI. Prefer API `outstanding_amount` when present.
 */
export function computeInvoiceOutstanding(invoice: Invoice): number {
  const raw = invoice.outstanding_amount ?? invoice.amount_due;
  if (raw != null && Number.isFinite(Number(raw))) {
    return Math.max(0, Math.round(Number(raw) * 100) / 100);
  }

  const total = Number(invoice.total_amount) || 0;
  let paidBase = 0;
  if (invoice.payments && invoice.payments.length > 0) {
    paidBase = invoice.payments
      .filter(
        (p) => p.status === "completed" || p.status === "partially_paid",
      )
      .reduce((sum, p) => {
        const amount = Number.parseFloat(String(p.amount)) || 0;
        const fee = Number.parseFloat(String(p.processing_fee ?? 0)) || 0;
        return sum + Math.max(0, amount - fee);
      }, 0);
  } else if (invoice.paid_amount != null) {
    paidBase = Number.parseFloat(String(invoice.paid_amount)) || 0;
  }
  const outstanding = total - paidBase;
  return Math.max(0, Math.round(outstanding * 100) / 100);
}
