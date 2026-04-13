"use client";

import { InvoicePaymentSection } from "@/components/invoices/InvoicePaymentSection";
import { formatCurrency, formatNumber } from "@/lib/currency";
import {
  formatInvoiceDetailDate,
  formatInvoicePeriodEnd,
  invoiceStatusBadge,
  isOverdue,
  paymentModeBadgeText,
} from "@/lib/invoices/invoiceDetailDisplay";
import type { Company } from "@/models/Company";
import type { Invoice, InvoiceItem } from "@/models/Invoice";
import type { Payment } from "@/models/Payment";

const cardCls =
  "rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50";

function InvoiceFinancialSummaryCard({ invoice }: { invoice: Invoice }) {
  const totalProcessingFee = (invoice.payments ?? []).reduce(
    (sum, p) => sum + (Number(p.processing_fee) || 0),
    0,
  );
  const paid = invoice.paid_amount ?? 0;
  const total = invoice.total_amount ?? 0;
  const isPartiallyPaid = paid > 0 && paid < total;
  return (
    <div className={cardCls}>
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Financial summary
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
          <strong>{formatCurrency(invoice.subtotal, invoice.currency_code)}</strong>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-zinc-600 dark:text-zinc-400">Tax amount</span>
          <strong>{formatCurrency(invoice.tax_amount, invoice.currency_code)}</strong>
        </div>
        <hr className="border-zinc-200 dark:border-zinc-800" />
        <div className="flex justify-between gap-4">
          <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Total amount
          </span>
          <strong className="text-base text-sky-600 dark:text-sky-400">
            {formatCurrency(invoice.total_amount, invoice.currency_code)}
          </strong>
        </div>
        {(paid > 0 || (invoice.amount_due ?? 0) > 0) && (
          <hr className="border-zinc-200 dark:border-zinc-800" />
        )}
        {totalProcessingFee > 0 ? (
          <div className="flex justify-between gap-4">
            <span className="text-zinc-600 dark:text-zinc-400">Processing fee</span>
            <strong>{formatCurrency(totalProcessingFee, invoice.currency_code)}</strong>
          </div>
        ) : null}
        {paid > 0 ? (
          <div className="flex justify-between gap-4">
            <span className="text-zinc-600 dark:text-zinc-400">Paid amount</span>
            <div className="text-end">
              <strong
                className={
                  isPartiallyPaid
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }
              >
                {formatCurrency(paid, invoice.currency_code)}
              </strong>
              {isPartiallyPaid ? (
                <div className="text-xs text-zinc-500">(partially paid)</div>
              ) : null}
            </div>
          </div>
        ) : null}
        {(invoice.amount_due ?? 0) > 0 ? (
          <div className="flex justify-between gap-4">
            <span className="text-zinc-600 dark:text-zinc-400">Due amount</span>
            <strong className="text-rose-600 dark:text-rose-400">
              {formatCurrency(invoice.amount_due ?? 0, invoice.currency_code)}
            </strong>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export type InvoiceDetailContentProps = {
  invoice: Invoice;
  company: Company | undefined;
  hasCustomer: boolean;
  billToDisplayName: string;
  sellerDisplayName: string;
  onPaymentSuccess: () => void;
};

export function InvoiceDetailContent({
  invoice,
  company,
  hasCustomer,
  billToDisplayName,
  sellerDisplayName,
  onPaymentSuccess,
}: InvoiceDetailContentProps) {
  const outstandingAmount =
    invoice.amount_due ??
    (invoice.total_amount - (invoice.paid_amount ?? 0));
  const { primary, showOverdue } = invoiceStatusBadge(
    invoice.status,
    invoice.due_date,
    outstandingAmount,
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className={cardCls}>
            <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Invoice details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-sm">
                <p>
                  <strong className="text-zinc-700 dark:text-zinc-300">
                    Invoice number:
                  </strong>{" "}
                  {invoice.invoice_number}
                </p>
                {invoice.po_number ? (
                  <p>
                    <strong className="text-zinc-700 dark:text-zinc-300">
                      PO number:
                    </strong>{" "}
                    {invoice.po_number}
                  </p>
                ) : null}
                <p>
                  <strong className="text-zinc-700 dark:text-zinc-300">
                    Invoice period:
                  </strong>{" "}
                  {formatInvoiceDetailDate(invoice.invoice_date)} to{" "}
                  {formatInvoicePeriodEnd(invoice)}
                </p>
                <p>
                  <strong className="text-zinc-700 dark:text-zinc-300">
                    Due date:
                  </strong>{" "}
                  <span
                    className={
                      isOverdue(invoice.due_date, invoice.status)
                        ? "font-bold text-rose-600 dark:text-rose-400"
                        : ""
                    }
                  >
                    {formatInvoiceDetailDate(invoice.due_date)}
                  </span>
                </p>
                <p className="flex flex-wrap items-center gap-2">
                  <strong className="text-zinc-700 dark:text-zinc-300">Status:</strong>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${primary.className}`}
                  >
                    {primary.text}
                  </span>
                  {showOverdue ? (
                    <span className="inline-flex rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-medium text-white">
                      Overdue
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <strong className="text-zinc-700 dark:text-zinc-300">
                    Payment mode:
                  </strong>{" "}
                  <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-900 dark:bg-violet-950/60 dark:text-violet-100">
                    {paymentModeBadgeText(invoice.payment_mode)}
                  </span>
                </p>
                <p>
                  <strong className="text-zinc-700 dark:text-zinc-300">Currency:</strong>{" "}
                  {invoice.currency_code}
                </p>
                <p>
                  <strong className="text-zinc-700 dark:text-zinc-300">Created:</strong>{" "}
                  {formatInvoiceDetailDate(invoice.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className={cardCls}>
            <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Bill to
            </h3>
            {(invoice.customer || invoice.company) && (
              <div className="space-y-2 text-sm">
                <p>
                  <strong className="text-zinc-700 dark:text-zinc-300">
                    {invoice.customer ? "Customer" : "Company"}:
                  </strong>{" "}
                  {billToDisplayName}
                </p>
                <p>
                  <strong className="text-zinc-700 dark:text-zinc-300">Email:</strong>{" "}
                  {hasCustomer
                    ? (invoice.customer?.email ?? "—")
                    : (invoice.company?.email ?? "—")}
                </p>
                <p>
                  <strong className="text-zinc-700 dark:text-zinc-300">Phone:</strong>{" "}
                  {hasCustomer
                    ? (invoice.customer?.phone ?? "—")
                    : (invoice.company?.phone != null
                        ? String(invoice.company.phone)
                        : "—")}
                </p>
                {hasCustomer && invoice.customer?.profile?.address ? (
                  <p>
                    <strong className="text-zinc-700 dark:text-zinc-300">
                      Address:
                    </strong>{" "}
                    {invoice.customer.profile.address}
                  </p>
                ) : null}
                <p>
                  <strong className="text-zinc-700 dark:text-zinc-300">Country:</strong>{" "}
                  {hasCustomer && invoice.customer?.profile?.country
                    ? invoice.customer.profile.country
                    : (invoice.company?.country ?? "—")}
                </p>
                {hasCustomer && company?.name ? (
                  <p className="mt-2 mb-0">
                    <strong className="text-zinc-700 dark:text-zinc-300">Company:</strong>{" "}
                    {company.name}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={cardCls}>
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Invoice items
        </h3>
        {invoice.items && invoice.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
                  <th className="py-2 pr-2 font-semibold">Product</th>
                  <th className="py-2 pr-2 font-semibold">SKU</th>
                  <th className="py-2 pr-2 font-semibold">Description</th>
                  <th className="py-2 pr-2 text-end font-semibold">Qty</th>
                  <th className="py-2 pr-2 text-end font-semibold">Price</th>
                  <th className="py-2 pr-2 text-end font-semibold">Tax</th>
                  <th className="py-2 pr-2 text-end font-semibold">Amount</th>
                  <th className="py-2 text-end font-semibold">Total price</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item: InvoiceItem, index: number) => {
                  const lineTotal =
                    typeof item.line_total === "number"
                      ? item.line_total
                      : Number.parseFloat(String(item.line_total ?? 0)) || 0;
                  const taxRate =
                    typeof item.tax_rate === "number"
                      ? item.tax_rate
                      : Number.parseFloat(String(item.tax_rate ?? 0)) || 0;
                  const taxAmount =
                    typeof item.tax_amount === "number" && item.tax_amount !== null
                      ? item.tax_amount
                      : (lineTotal * taxRate) / 100;
                  const totalAmount = lineTotal + taxAmount;
                  return (
                    <tr
                      key={item.id ?? index}
                      className="border-b border-zinc-100 dark:border-zinc-800/80"
                    >
                      <td className="py-2 pr-2 align-top">
                        {item.product ? (
                          <strong>{item.product.name}</strong>
                        ) : (
                          <strong>{item.description ?? "Service item"}</strong>
                        )}
                      </td>
                      <td className="py-2 pr-2 align-top text-xs text-zinc-500">
                        {item.product?.sku ?? "—"}
                      </td>
                      <td className="max-w-[200px] py-2 pr-2 align-top text-start text-sm">
                        {item.description ?? (item.product?.description ?? "Service item")}
                      </td>
                      <td className="py-2 pr-2 align-top text-end">
                        {formatNumber(item.quantity, 0)}
                      </td>
                      <td className="py-2 pr-2 align-top text-end">
                        {formatCurrency(item.unit_price, invoice.currency_code)}
                      </td>
                      <td className="py-2 pr-2 align-top text-end">
                        {formatCurrency(taxAmount, invoice.currency_code)}
                      </td>
                      <td className="py-2 pr-2 align-top text-end">
                        <strong>{formatCurrency(lineTotal, invoice.currency_code)}</strong>
                      </td>
                      <td className="py-2 align-top text-end">
                        <strong>{formatCurrency(totalAmount, invoice.currency_code)}</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-sm text-zinc-500">No items found</p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cardCls}>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Notes & terms
          </h3>
          <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
            <p>1. Payment can be made as bank transfer or direct deposit.</p>
            <p>2. Cheque can be issued in favor of {sellerDisplayName}.</p>
            <p>3. Services may be disconnected after the due date without further notice.</p>
            {invoice.company?.profile?.vat_rate != null ? (
              <p>
                4. Value Added Tax (VAT) {invoice.company.profile.vat_rate}% will be
                applicable to this invoice.
              </p>
            ) : null}
          </div>
        </div>
        <InvoiceFinancialSummaryCard invoice={invoice} />
      </div>

      {invoice.payments && invoice.payments.length > 0 ? (
        <div className={cardCls}>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Payment history
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
                  <th className="py-2 pr-2 font-semibold">Date</th>
                  <th className="py-2 pr-2 font-semibold">Method</th>
                  <th className="py-2 pr-2 font-semibold">Total amount</th>
                  <th className="py-2 pr-2 font-semibold">Amount applied</th>
                  <th className="py-2 pr-2 font-semibold">Status</th>
                  <th className="py-2 font-semibold">Reference</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((payment: Payment, index: number) => {
                  const processingFee = payment.processing_fee ?? 0;
                  const totalWithFee = payment.amount ?? 0;
                  const baseApplied = Math.max(0, totalWithFee - processingFee);
                  return (
                    <tr
                      key={payment.id ?? index}
                      className="border-b border-zinc-100 dark:border-zinc-800/80"
                    >
                      <td className="py-2 pr-2">
                        {formatInvoiceDetailDate(payment.payment_date)}
                      </td>
                      <td className="py-2 pr-2">{String(payment.payment_method)}</td>
                      <td className="py-2 pr-2">
                        <strong>{formatCurrency(totalWithFee, payment.currency_code)}</strong>
                      </td>
                      <td className="py-2 pr-2 text-zinc-500">
                        {formatCurrency(baseApplied, payment.currency_code)}
                      </td>
                      <td className="py-2 pr-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                            payment.status === "completed"
                              ? "bg-emerald-600"
                              : "bg-amber-500"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-2">{payment.reference_number ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <InvoicePaymentSection
        invoice={invoice}
        showFeeDetails
        onPaymentSuccess={onPaymentSuccess}
      />
    </div>
  );
}
