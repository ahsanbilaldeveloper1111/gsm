"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DeleteConfirmationDialog } from "@/components/crud/DeleteConfirmationDialog";
import { FormField, FormModal } from "@/components/crud/FormModal";
import { InvoiceDetailModal } from "@/components/invoices/InvoiceDetailModal";
import { InvoiceListTable } from "@/components/invoices/InvoiceListTable";
import { useCompanies } from "@/hooks/company/useCompanies";
import { useCustomers } from "@/hooks/customers/useCustomers";
import { useInvoiceDetails } from "@/hooks/invoices/useInvoiceDetails";
import { useInvoiceMutations } from "@/hooks/invoices/useInvoiceMutations";
import { useInvoices } from "@/hooks/invoices/useInvoices";
import { usePermissions } from "@/hooks/permissions/usePermissions";
import { useVendors } from "@/hooks/vendors/useVendors";
import { useActiveCurrencies } from "@/hooks/currencies/useActiveCurrencies";
import { extractListRows } from "@/lib/api/extractApiData";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import {
  buildInvoiceListSearchParams,
  parseInvoiceListSearchParams,
  type InvoiceListUrlState,
} from "@/lib/invoices/invoiceListUrl";
import { resolveDeleteItemLabel } from "@/lib/crud/resolveDeleteItemLabel";
import { unwrapApiSuccessData } from "@/lib/dashboard/unwrapAnalyticsPayload";
import {
  showAppToast,
  showBillingBackendErrorToast,
} from "@/lib/toast/appToast";
import type {
  CreateInvoiceData,
  CreateInvoiceItemData,
  IndexInvoiceParams,
  Invoice,
  InvoiceStatus,
  UpdateInvoiceData,
} from "@/models/Invoice";
import type { Customer } from "@/models/Customer";
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

function lineItemsSubtotal(items: CreateInvoiceItemData[]): number {
  return items.reduce((a, i) => a + i.quantity * i.unit_price, 0);
}

/** Map `vat_rate` / `tax_rate` for validators that expect either name. */
function normalizeLineItems(
  items: CreateInvoiceItemData[],
): CreateInvoiceItemData[] {
  return items.map((it) => {
    const vat = it.vat_rate;
    const tax = it.tax_rate;
    return {
      ...it,
      tax_rate: tax ?? vat,
      vat_rate: vat ?? tax,
    };
  });
}

const INVOICE_STATUS_OPTIONS: InvoiceStatus[] = [
  "draft",
  "sent",
  "paid",
  "pending",
  "partially_paid",
  "overdue",
  "cancelled",
];

const SORT_PRESETS = [
  { value: "created_at_desc", label: "Created at (newest first)" },
  { value: "created_at_asc", label: "Created at (oldest first)" },
  { value: "invoice_date_desc", label: "Invoice date (newest first)" },
  { value: "invoice_date_asc", label: "Invoice date (oldest first)" },
  {
    value: "last_payment_date_desc",
    label: "Last payment date (newest first)",
  },
  {
    value: "last_payment_date_asc",
    label: "Last payment date (oldest first)",
  },
] as const;

const LIST_LIMIT_OPTIONS = [10, 20, 25, 50, 100] as const;

function sortPresetValue(column: string, dir: "asc" | "desc"): string {
  return `${column}_${dir}`;
}

function parseSortPreset(
  value: string,
): { column: string; dir: "asc" | "desc" } | null {
  const m = /^(.+)_(asc|desc)$/.exec(value);
  if (!m) return null;
  return { column: m[1], dir: m[2] as "asc" | "desc" };
}

function formatInvoiceSummaryValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function InvoiceListSummaryBar({ response }: { response: unknown }) {
  if (!response || typeof response !== "object") return null;
  const summary = (response as { summary?: unknown }).summary;
  if (summary == null) return null;
  if (
    typeof summary === "object" &&
    !Array.isArray(summary) &&
    Object.keys(summary).length === 0
  ) {
    return null;
  }
  const entries =
    typeof summary === "object" && summary !== null && !Array.isArray(summary)
      ? Object.entries(summary as Record<string, unknown>)
      : [["summary", summary] as [string, unknown]];

  return (
    <div className="mb-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
        List summary (API)
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {entries.map(([k, v]) => (
          <span
            key={k}
            className="inline-flex max-w-full items-baseline gap-1 rounded-lg border border-emerald-200/70 bg-white/80 px-2 py-1 text-xs text-emerald-950 dark:border-emerald-800 dark:bg-zinc-900/60 dark:text-emerald-50"
          >
            <span className="font-semibold">{k}</span>
            <span className="truncate font-mono opacity-90">
              {formatInvoiceSummaryValue(v)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function InvoiceCrudView() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSuperAdmin } = usePermissions();

  const [listState, setListState] = useState<InvoiceListUrlState>(() =>
    parseInvoiceListSearchParams(searchParams),
  );

  const debouncedSearch = useDebouncedValue(listState.search, 400);

  useEffect(() => {
    const q = buildInvoiceListSearchParams(listState, {
      searchOverride: debouncedSearch,
    });
    const next = q.toString();
    if (next === searchParams.toString()) return;
    router.replace(`${pathname}?${next}`, { scroll: false });
  }, [
    listState.page,
    listState.limit,
    listState.status,
    listState.tenant_id,
    listState.vendor_id,
    listState.crm_company_id,
    listState.date_from,
    listState.date_to,
    listState.column,
    listState.dir,
    listState.payment_status,
    listState.crm_company_not_null,
    listState.display_currency,
    debouncedSearch,
    pathname,
    router,
    searchParams,
  ]);

  const vendorsQuery = useVendors({
    limit: 500,
    "order[column]": "name",
    "order[dir]": "asc",
  });
  const vendorRows = extractListRows(vendorsQuery.data).rows as {
    id: number;
    name: string;
  }[];

  const vendorIdNum = listState.vendor_id.trim()
    ? Number.parseInt(listState.vendor_id, 10)
    : NaN;
  const companiesQuery = useCompanies(
    Number.isFinite(vendorIdNum)
      ? {
          limit: 1000,
          load_profile: true,
          vendor_id: vendorIdNum,
        }
      : undefined,
    { enabled: Number.isFinite(vendorIdNum) },
  );
  const companyRows = extractListRows(companiesQuery.data).rows as {
    tenant_id?: string | null;
    name?: string;
    id?: number;
  }[];

  const customersQuery = useCustomers(
    isSuperAdmin && listState.tenant_id.trim()
      ? {
          limit: 500,
          load_profile: true,
          tenant_id: listState.tenant_id.trim(),
        }
      : undefined,
    {
      enabled: isSuperAdmin && !!listState.tenant_id.trim(),
    },
  );
  const customerRows = extractListRows(customersQuery.data)
    .rows as unknown as Customer[];

  const currenciesQuery = useActiveCurrencies();
  const currencyOptions = useMemo(() => {
    const raw = currenciesQuery.data;
    const d = raw?.data;
    const list = Array.isArray(d) ? d : [];
    return list.map((c: { code: string }) => c.code).filter(Boolean);
  }, [currenciesQuery.data]);

  const listParams = useMemo((): IndexInvoiceParams => {
    const vendorParsed = listState.vendor_id.trim()
      ? Number.parseInt(listState.vendor_id, 10)
      : NaN;
    return {
      page: listState.page,
      limit: listState.limit,
      sort_field: listState.column,
      sort_direction: listState.dir,
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(listState.status ? { status: listState.status } : {}),
      ...(listState.payment_status.trim()
        ? { payment_status: listState.payment_status.trim() }
        : {}),
      ...(Number.isFinite(vendorParsed) ? { vendor_id: vendorParsed } : {}),
      ...(listState.tenant_id.trim()
        ? { tenant_id: listState.tenant_id.trim() }
        : {}),
      ...(listState.date_from ? { date_from: listState.date_from } : {}),
      ...(listState.date_to ? { date_to: listState.date_to } : {}),
      ...(listState.crm_company_id.trim()
        ? { crm_company_id: listState.crm_company_id.trim() }
        : {}),
      ...(listState.crm_company_not_null
        ? { crm_company_not_null: true }
        : {}),
    };
  }, [
    listState.page,
    listState.limit,
    listState.status,
    listState.tenant_id,
    listState.vendor_id,
    listState.crm_company_id,
    listState.date_from,
    listState.date_to,
    listState.column,
    listState.dir,
    listState.payment_status,
    listState.crm_company_not_null,
    debouncedSearch,
  ]);

  const listQuery = useInvoices(listParams);
  const { pagination } = extractListRows(listQuery.data);
  const mutations = useInvoiceMutations();
  const [detailId, setDetailId] = useState<number | string | null>(null);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  const deleteItemLabel = useMemo(
    () =>
      resolveDeleteItemLabel(listQuery.data, deleteId, {
        labelKeys: ["invoice_number"],
      }),
    [listQuery.data, deleteId],
  );

  const editQuery = useInvoiceDetails(editId);

  const tenantDisplayNameById = useMemo(() => {
    const o: Record<string, string> = {};
    for (const c of companyRows) {
      const tid =
        c.tenant_id != null && String(c.tenant_id).trim() !== ""
          ? String(c.tenant_id).trim()
          : c.id != null
            ? String(c.id)
            : "";
      if (tid && c.name) o[tid] = c.name;
    }
    return o;
  }, [companyRows]);

  const [tenantId, setTenantId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [crmCompanyId, setCrmCompanyId] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(defaultInvoiceDate());
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [endDate, setEndDate] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("one_time");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState("");
  const [subtotalStr, setSubtotalStr] = useState("");
  const [taxAmountStr, setTaxAmountStr] = useState("");
  const [totalAmountStr, setTotalAmountStr] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [itemsJson, setItemsJson] = useState(defaultItemsJson);

  useEffect(() => {
    if (!formOpen) return;
    if (editId == null) {
      setTenantId("");
      setVendorId("");
      setCrmCompanyId("");
      setPoNumber("");
      setInvoiceDate(defaultInvoiceDate());
      setDueDate(defaultDueDate());
      setEndDate("");
      setPaymentMode("one_time");
      setCurrencyCode("USD");
      setExchangeRate("");
      setSubtotalStr("");
      setTaxAmountStr("");
      setTotalAmountStr("");
      setNotes("");
      setTerms("");
      setItemsJson(defaultItemsJson);
      return;
    }
    const inv = unwrapApiSuccessData<Invoice>(editQuery.data);
    if (!inv) return;
    setTenantId(inv.tenant_id ?? "");
    setVendorId(inv.vendor_id != null ? String(inv.vendor_id) : "");
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
    setSubtotalStr(String(inv.subtotal ?? ""));
    setTaxAmountStr(String(inv.tax_amount ?? ""));
    setTotalAmountStr(String(inv.total_amount ?? ""));
    setNotes(inv.notes ?? "");
    setTerms(inv.terms_conditions ?? "");
    const lines: CreateInvoiceItemData[] = (inv.items ?? []).map((it) => ({
      product_id: it.product_id,
      quantity: it.quantity,
      unit_price: it.unit_price,
      vat_rate: it.tax_rate,
      tax_rate: it.tax_rate,
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

  function resolveAmounts(
    items: CreateInvoiceItemData[],
  ): { subtotal: number; tax_amount?: number; total_amount: number } {
    const fromLines = lineItemsSubtotal(items);
    let subtotal = Number.parseFloat(subtotalStr);
    if (!Number.isFinite(subtotal) || subtotal < 0) subtotal = fromLines;

    let tax: number | undefined;
    if (taxAmountStr.trim() !== "") {
      const t = Number.parseFloat(taxAmountStr);
      tax = Number.isFinite(t) && t >= 0 ? t : undefined;
    }

    let total = Number.parseFloat(totalAmountStr);
    if (!Number.isFinite(total) || total < 0) {
      total = subtotal + (tax ?? 0);
    }
    return { subtotal, tax_amount: tax, total_amount: total };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editId == null && !tenantId.trim()) {
      showAppToast("Tenant ID is required (must match a company tenant).", "error");
      return;
    }

    const rawItems = parseItems();
    if (!rawItems) return;
    const items = normalizeLineItems(rawItems);

    const exchangeParsed = exchangeRate.trim()
      ? Number.parseFloat(exchangeRate)
      : undefined;

    const { subtotal, tax_amount, total_amount } = resolveAmounts(items);

    const vendorParsed = vendorId.trim()
      ? Number.parseInt(vendorId, 10)
      : undefined;
    const vendor_id =
      vendorParsed !== undefined && Number.isFinite(vendorParsed)
        ? vendorParsed
        : null;

    try {
      if (editId == null) {
        const body: CreateInvoiceData = {
          tenant_id: tenantId.trim(),
          vendor_id,
          crm_company_id: crmCompanyId.trim() || null,
          po_number: poNumber.trim() || null,
          invoice_date: invoiceDate,
          due_date: dueDate,
          end_date: endDate.trim() || undefined,
          payment_mode: paymentMode,
          subtotal,
          total_amount,
          tax_amount,
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
          vendor_id,
          po_number: poNumber.trim() || null,
          invoice_date: invoiceDate,
          due_date: dueDate,
          end_date: endDate.trim() || undefined,
          payment_mode: paymentMode,
          subtotal,
          total_amount,
          tax_amount,
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

  const sortSelectValue = SORT_PRESETS.some(
    (p) =>
      p.value === sortPresetValue(listState.column, listState.dir),
  )
    ? sortPresetValue(listState.column, listState.dir)
    : SORT_PRESETS[0].value;

  return (
    <>
      <div className="mb-4 space-y-3 rounded-2xl border border-zinc-200/80 bg-white/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Filters — synced to the URL for sharing/bookmarks. Search is debounced
          before calling the API.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Search
            </label>
            <input
              type="search"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={listState.search}
              onChange={(ev) =>
                setListState((s) => ({ ...s, search: ev.target.value, page: 1 }))
              }
              placeholder="Invoice #, customer…"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Vendor
            </label>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={listState.vendor_id}
              onChange={(ev) => {
                const vendor_id = ev.target.value;
                setListState((s) => ({
                  ...s,
                  page: 1,
                  vendor_id,
                  tenant_id: "",
                  crm_company_id: "",
                }));
              }}
            >
              <option value="">All vendors</option>
              {vendorRows.map((v) => (
                <option key={v.id} value={String(v.id)}>
                  {v.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-zinc-500">
              Select a vendor to load tenant companies.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Tenant (company)
            </label>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
              disabled={!Number.isFinite(vendorIdNum)}
              value={listState.tenant_id}
              onChange={(ev) => {
                const tenant_id = ev.target.value;
                setListState((s) => ({
                  ...s,
                  page: 1,
                  tenant_id,
                  crm_company_id: "",
                }));
              }}
            >
              <option value="">
                {Number.isFinite(vendorIdNum)
                  ? "All tenants"
                  : "Select vendor first…"}
              </option>
              {companyRows.map((c) => {
                const tid = String(c.tenant_id ?? c.id ?? "");
                if (!tid) return null;
                return (
                  <option key={tid} value={tid}>
                    {c.name ?? tid}
                  </option>
                );
              })}
            </select>
          </div>
          {isSuperAdmin ? (
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Customer (CRM)
              </label>
              <select
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
                disabled={!listState.tenant_id.trim()}
                value={listState.crm_company_id}
                onChange={(ev) =>
                  setListState((s) => ({
                    ...s,
                    page: 1,
                    crm_company_id: ev.target.value,
                  }))
                }
              >
                <option value="">
                  {listState.tenant_id.trim()
                    ? "All customers"
                    : "Select tenant first…"}
                </option>
                {customerRows.map((cu) => {
                  const cid =
                    cu.crm_company_id ?? cu.profile?.crm_company_id ?? "";
                  if (!cid) return null;
                  return (
                    <option key={cu.id} value={cid}>
                      {cu.name ?? cid}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : null}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Display currency
            </label>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={listState.display_currency}
              onChange={(ev) =>
                setListState((s) => ({
                  ...s,
                  display_currency: ev.target.value,
                }))
              }
            >
              <option value="">Invoice currency</option>
              {currencyOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Status
            </label>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={listState.status}
              onChange={(ev) =>
                setListState((s) => ({
                  ...s,
                  page: 1,
                  status: ev.target.value as InvoiceStatus | "",
                }))
              }
            >
              <option value="">All</option>
              {INVOICE_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Payment status
            </label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={listState.payment_status}
              onChange={(ev) =>
                setListState((s) => ({
                  ...s,
                  page: 1,
                  payment_status: ev.target.value,
                }))
              }
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Page size
            </label>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={listState.limit}
              onChange={(ev) =>
                setListState((s) => ({
                  ...s,
                  page: 1,
                  limit: Number(ev.target.value),
                }))
              }
            >
              {LIST_LIMIT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Date from
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={listState.date_from}
              max={listState.date_to || undefined}
              onChange={(ev) =>
                setListState((s) => ({
                  ...s,
                  page: 1,
                  date_from: ev.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Date to
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={listState.date_to}
              min={listState.date_from || undefined}
              onChange={(ev) =>
                setListState((s) => ({
                  ...s,
                  page: 1,
                  date_to: ev.target.value,
                }))
              }
            />
          </div>
          <div className="flex items-end">
            {(listState.date_from || listState.date_to) && (
              <button
                type="button"
                className="w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-900 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100"
                onClick={() =>
                  setListState((s) => ({
                    ...s,
                    page: 1,
                    date_from: "",
                    date_to: "",
                  }))
                }
              >
                Clear dates
              </button>
            )}
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Sort
            </label>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={sortSelectValue}
              onChange={(ev) => {
                const parsed = parseSortPreset(ev.target.value);
                if (!parsed) return;
                setListState((s) => ({
                  ...s,
                  page: 1,
                  column: parsed.column,
                  dir: parsed.dir,
                }));
              }}
            >
              {SORT_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          {!isSuperAdmin ? (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                CRM company ID (raw)
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                value={listState.crm_company_id}
                onChange={(ev) =>
                  setListState((s) => ({
                    ...s,
                    page: 1,
                    crm_company_id: ev.target.value,
                  }))
                }
                placeholder="Optional filter"
              />
            </div>
          ) : null}
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
              <input
                type="checkbox"
                checked={listState.crm_company_not_null}
                onChange={(ev) =>
                  setListState((s) => ({
                    ...s,
                    page: 1,
                    crm_company_not_null: ev.target.checked,
                  }))
                }
              />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
                CRM company not null
              </span>
            </label>
          </div>
        </div>
      </div>

      <InvoiceListSummaryBar response={listQuery.data} />

      <InvoiceListTable
        query={listQuery}
        title="Invoices"
        displayCurrencyCode={listState.display_currency}
        isSuperAdmin={isSuperAdmin}
        pagination={pagination}
        onPageChange={(page) => setListState((s) => ({ ...s, page }))}
        onCreate={openCreate}
        onView={(id) => setDetailId(id)}
        onEdit={(id) => {
          setEditId(id);
          setFormOpen(true);
        }}
        onDelete={(id) => setDeleteId(id)}
      />

      <InvoiceDetailModal
        open={detailId != null}
        onClose={() => setDetailId(null)}
        invoiceId={detailId}
        tenantDisplayNameById={tenantDisplayNameById}
        onEdit={(inv) => {
          setDetailId(null);
          setEditId(inv.id);
          setFormOpen(true);
        }}
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
            required={editId == null}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={tenantId}
            onChange={(ev) => setTenantId(ev.target.value)}
            placeholder="Required on create — company tenant_id"
          />
        </FormField>
        <FormField label="Vendor ID">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={vendorId}
            onChange={(ev) => setVendorId(ev.target.value)}
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
        <div className="grid gap-3 sm:grid-cols-3">
          <FormField label="Subtotal">
            <input
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={subtotalStr}
              onChange={(ev) => setSubtotalStr(ev.target.value)}
              placeholder="Blank = sum of line items"
              inputMode="decimal"
            />
          </FormField>
          <FormField label="Tax amount">
            <input
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={taxAmountStr}
              onChange={(ev) => setTaxAmountStr(ev.target.value)}
              placeholder="Optional"
              inputMode="decimal"
            />
          </FormField>
          <FormField label="Total amount">
            <input
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={totalAmountStr}
              onChange={(ev) => setTotalAmountStr(ev.target.value)}
              placeholder="Blank = subtotal + tax"
              inputMode="decimal"
            />
          </FormField>
        </div>
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
            Each line: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">quantity</code>,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">unit_price</code>, optional{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">product_id</code>,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">vat_rate</code> /{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">tax_rate</code>,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">description</code>.
          </p>
        </FormField>
      </FormModal>

      <DeleteConfirmationDialog
        show={deleteId != null}
        title="Delete invoice?"
        message="Deletes via DELETE /invoices/{id}. The API may reject if payments exist."
        itemName={deleteItemLabel}
        onConfirm={confirmDelete}
        onHide={() => setDeleteId(null)}
        isDeleting={mutations.remove.isPending}
      />
    </>
  );
}
