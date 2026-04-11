"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudEntityTable } from "@/components/crud/CrudEntityTable";
import { FormField, FormModal } from "@/components/crud/FormModal";
import { RecordDetailModal } from "@/components/crud/RecordDetailModal";
import { useInvoiceDetails } from "@/hooks/invoices/useInvoiceDetails";
import { useInvoiceMutations } from "@/hooks/invoices/useInvoiceMutations";
import { useInvoices } from "@/hooks/invoices/useInvoices";
import { unwrapApiSuccessData } from "@/lib/dashboard/unwrapAnalyticsPayload";
import {
  showAppToast,
  showBillingBackendErrorToast,
} from "@/lib/toast/appToast";
import type {
  CreateInvoiceData,
  CreateInvoiceItemData,
  Invoice,
  UpdateInvoiceData,
} from "@/models/Invoice";
import type { PaymentMode } from "@/models/Payment";

function defaultInvoiceDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

const defaultItemsJson =
  '[\n  { "quantity": 1, "unit_price": 0, "vat_rate": 0 }\n]';

export function InvoiceCrudView() {
  const listQuery = useInvoices();
  const mutations = useInvoiceMutations();
  const [detailId, setDetailId] = useState<number | string | null>(null);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  const detailQuery = useInvoiceDetails(detailId);
  const editQuery = useInvoiceDetails(editId);

  const [tenantId, setTenantId] = useState("");
  const [crmCompanyId, setCrmCompanyId] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(defaultInvoiceDate());
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [endDate, setEndDate] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("one_time");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [itemsJson, setItemsJson] = useState(defaultItemsJson);

  useEffect(() => {
    if (!formOpen) return;
    if (editId == null) {
      setTenantId("");
      setCrmCompanyId("");
      setPoNumber("");
      setInvoiceDate(defaultInvoiceDate());
      setDueDate(defaultDueDate());
      setEndDate("");
      setPaymentMode("one_time");
      setCurrencyCode("USD");
      setExchangeRate("");
      setNotes("");
      setTerms("");
      setItemsJson(defaultItemsJson);
      return;
    }
    const inv = unwrapApiSuccessData<Invoice>(editQuery.data);
    if (!inv) return;
    setTenantId(inv.tenant_id ?? "");
    setCrmCompanyId(inv.crm_company_id ?? "");
    setPoNumber(inv.po_number ?? "");
    setInvoiceDate(inv.invoice_date?.slice(0, 10) ?? "");
    setDueDate(inv.due_date?.slice(0, 10) ?? "");
    setEndDate(inv.end_date?.slice(0, 10) ?? "");
    setPaymentMode(inv.payment_mode);
    setCurrencyCode(inv.currency_code);
    setExchangeRate(
      inv.exchange_rate != null ? String(inv.exchange_rate) : "",
    );
    setNotes(inv.notes ?? "");
    setTerms(inv.terms_conditions ?? "");
    const lines: CreateInvoiceItemData[] = (inv.items ?? []).map((it) => ({
      product_id: it.product_id,
      quantity: it.quantity,
      unit_price: it.unit_price,
      vat_rate: it.tax_rate,
    }));
    setItemsJson(
      lines.length > 0
        ? JSON.stringify(lines, null, 2)
        : defaultItemsJson,
    );
  }, [formOpen, editId, editQuery.data]);

  const openCreate = () => {
    setEditId(null);
    setFormOpen(true);
  };

  function parseItems(): CreateInvoiceItemData[] | null {
    try {
      const raw = JSON.parse(itemsJson) as unknown;
      if (!Array.isArray(raw) || raw.length === 0) {
        showAppToast("Items must be a non-empty JSON array.", "error");
        return null;
      }
      return raw as CreateInvoiceItemData[];
    } catch {
      showAppToast("Invalid items JSON.", "error");
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const items = parseItems();
    if (!items) return;

    const exchangeParsed = exchangeRate.trim()
      ? Number.parseFloat(exchangeRate)
      : undefined;

    try {
      if (editId == null) {
        const body: CreateInvoiceData = {
          tenant_id: tenantId.trim() || null,
          crm_company_id: crmCompanyId.trim() || null,
          po_number: poNumber.trim() || null,
          invoice_date: invoiceDate,
          due_date: dueDate,
          end_date: endDate.trim() || undefined,
          payment_mode: paymentMode,
          currency_code: currencyCode.trim(),
          exchange_rate:
            exchangeParsed !== undefined && Number.isFinite(exchangeParsed)
              ? exchangeParsed
              : undefined,
          notes: notes.trim() || undefined,
          terms_conditions: terms.trim() || undefined,
          items,
        };
        await mutations.create.mutateAsync(body);
        showAppToast("Invoice created.", "success");
      } else {
        const body: UpdateInvoiceData = {
          tenant_id: tenantId.trim() || null,
          po_number: poNumber.trim() || null,
          invoice_date: invoiceDate,
          due_date: dueDate,
          end_date: endDate.trim() || undefined,
          payment_mode: paymentMode,
          currency_code: currencyCode.trim(),
          exchange_rate:
            exchangeParsed !== undefined && Number.isFinite(exchangeParsed)
              ? exchangeParsed
              : undefined,
          notes: notes.trim() || undefined,
          terms_conditions: terms.trim() || undefined,
          items,
        };
        await mutations.update.mutateAsync({ id: editId, body });
        showAppToast("Invoice updated.", "success");
      }
      setFormOpen(false);
      setEditId(null);
    } catch (err) {
      showBillingBackendErrorToast(err);
    }
  }

  async function confirmDelete() {
    if (deleteId == null) return;
    try {
      await mutations.remove.mutateAsync(deleteId);
      showAppToast("Invoice deleted.", "success");
      setDeleteId(null);
    } catch (err) {
      showBillingBackendErrorToast(err);
    }
  }

  return (
    <>
      <CrudEntityTable
        query={listQuery}
        title="Invoices"
        onCreate={openCreate}
        onView={(id) => setDetailId(id)}
        onEdit={(id) => {
          setEditId(id);
          setFormOpen(true);
        }}
        onDelete={(id) => setDeleteId(id)}
      />

      <RecordDetailModal
        open={detailId != null}
        title="Invoice"
        subtitle="Extended detail from GET /invoices/{id}/details."
        data={detailQuery.data ?? null}
        loading={detailQuery.isPending && detailId != null}
        error={detailQuery.isError ? String(detailQuery.error) : null}
        onClose={() => setDetailId(null)}
      />

      <FormModal
        open={formOpen}
        title={editId == null ? "New invoice" : "Edit invoice"}
        onClose={() => {
          setFormOpen(false);
          setEditId(null);
        }}
        onSubmit={handleSubmit}
        loading={mutations.create.isPending || mutations.update.isPending}
      >
        <FormField label="Tenant ID">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={tenantId}
            onChange={(ev) => setTenantId(ev.target.value)}
            placeholder="Optional"
          />
        </FormField>
        <FormField label="CRM company ID">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={crmCompanyId}
            onChange={(ev) => setCrmCompanyId(ev.target.value)}
            placeholder="Optional"
          />
        </FormField>
        <FormField label="PO number">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={poNumber}
            onChange={(ev) => setPoNumber(ev.target.value)}
            placeholder="Optional"
          />
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Invoice date">
            <input
              type="date"
              required
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={invoiceDate}
              onChange={(ev) => setInvoiceDate(ev.target.value)}
            />
          </FormField>
          <FormField label="Due date">
            <input
              type="date"
              required
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={dueDate}
              onChange={(ev) => setDueDate(ev.target.value)}
            />
          </FormField>
        </div>
        <FormField label="End date">
          <input
            type="date"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={endDate}
            onChange={(ev) => setEndDate(ev.target.value)}
            placeholder="Optional (recurring)"
          />
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Payment mode">
            <select
              required
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={paymentMode}
              onChange={(ev) =>
                setPaymentMode(ev.target.value as PaymentMode)
              }
            >
              <option value="one_time">one_time</option>
              <option value="recurring">recurring</option>
              <option value="subscription">subscription</option>
            </select>
          </FormField>
          <FormField label="Currency code">
            <input
              required
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={currencyCode}
              onChange={(ev) => setCurrencyCode(ev.target.value.toUpperCase())}
              placeholder="USD"
            />
          </FormField>
        </div>
        <FormField label="Exchange rate">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={exchangeRate}
            onChange={(ev) => setExchangeRate(ev.target.value)}
            placeholder="Optional"
          />
        </FormField>
        <FormField label="Notes">
          <textarea
            className="min-h-[72px] w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={notes}
            onChange={(ev) => setNotes(ev.target.value)}
          />
        </FormField>
        <FormField label="Terms & conditions">
          <textarea
            className="min-h-[72px] w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={terms}
            onChange={(ev) => setTerms(ev.target.value)}
          />
        </FormField>
        <FormField label="Items (JSON array)">
          <textarea
            required
            spellCheck={false}
            className="min-h-[140px] w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
            value={itemsJson}
            onChange={(ev) => setItemsJson(ev.target.value)}
          />
          <p className="mt-1 text-[11px] text-zinc-500">
            Each line item:{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              product_id
            </code>{" "}
            (optional),{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              quantity
            </code>
            ,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              unit_price
            </code>
            ,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              vat_rate
            </code>{" "}
            (optional).
          </p>
        </FormField>
      </FormModal>

      <ConfirmDialog
        open={deleteId != null}
        title="Delete invoice?"
        message="Deletes via DELETE /invoices/{id}. The API may reject if payments exist."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={mutations.remove.isPending}
      />
    </>
  );
}
