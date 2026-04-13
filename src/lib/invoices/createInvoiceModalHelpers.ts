import { extractListRows } from "@/lib/api/extractApiData";
import type { ApiSuccessResponse } from "@/lib/api/types";
import type {
  CreateInvoiceItemData,
  Invoice,
  InvoiceItem,
} from "@/models/Invoice";

export type InvoiceLineFormRow = {
  product_id?: number;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  description: string;
};

export type PricedProduct = {
  /** Catalog product id (for invoice line `product_id`). */
  id: number;
  name?: string;
  description?: string;
  base_price?: number;
  /** Resolved display/unit price (company selling price or product base). */
  effective_price?: number;
  /** Raw company/customer price from API when present. */
  selling_price?: number;
  vat_rate?: number;
  pricing_type?: string;
  company_pricing?: { custom_description?: string | null };
};

function num(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Maps list payloads from `GET /products/with-company-pricing`, `with-customer-pricing`,
 * or plain product lists into a consistent shape. Backend pricing rows use
 * `product_id`, `selling_price`, and nested `product` — not top-level `effective_price`.
 */
export function normalizeInvoiceProductRow(raw: unknown): PricedProduct | null {
  if (raw == null || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const prod = r.product as Record<string, unknown> | undefined;

  const productId =
    num(r.product_id) ?? num(prod?.id) ?? num(r.id);
  if (productId == null || productId <= 0) return null;

  const selling = num(r.selling_price);
  const companyPrice = num(r.company_price);
  const effective = num(r.effective_price);
  const baseNested = num(prod?.base_price);
  const baseRoot = num(r.base_price);

  const firstPrice = [
    selling,
    companyPrice,
    effective,
    baseNested,
    baseRoot,
  ].find((n) => n != null);

  const resolved =
    firstPrice != null && Number.isFinite(firstPrice) ? firstPrice : 0;

  const name =
    (typeof r.name === "string" && r.name.trim() !== "" && r.name) ||
    (typeof r.product_name === "string" &&
      r.product_name.trim() !== "" &&
      r.product_name) ||
    (typeof prod?.name === "string" &&
      String(prod.name).trim() !== "" &&
      String(prod.name)) ||
    undefined;

  const description =
    (typeof r.description === "string" && r.description) ||
    (typeof prod?.description === "string" && String(prod.description)) ||
    undefined;

  const vatRaw = num(r.vat_rate) ?? num(prod?.vat_rate);
  const vat_rate =
    vatRaw != null && Number.isFinite(vatRaw) ? vatRaw : undefined;

  const customDesc = r.custom_description;
  const company_pricing =
    customDesc != null && String(customDesc).trim() !== ""
      ? { custom_description: String(customDesc) }
      : undefined;

  return {
    id: Math.floor(productId),
    name,
    description,
    base_price: baseNested ?? baseRoot,
    selling_price: selling ?? companyPrice,
    effective_price: resolved,
    vat_rate,
    pricing_type:
      typeof r.pricing_type === "string" ? r.pricing_type : undefined,
    company_pricing,
  };
}

/** Extract list rows from an API envelope and normalize each to {@link PricedProduct}. */
export function normalizePricedProductsResponse(res: unknown): PricedProduct[] {
  const { rows } = extractListRows(res as ApiSuccessResponse<unknown>);
  const out: PricedProduct[] = [];
  for (const row of rows) {
    const p = normalizeInvoiceProductRow(row);
    if (p) out.push(p);
  }
  return out;
}

/** @deprecated Prefer {@link normalizePricedProductsResponse} for invoice UI. */
export function extractPricedProducts(res: unknown): PricedProduct[] {
  return normalizePricedProductsResponse(res);
}

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISODate(base: string, days: number): string {
  const d = new Date(base);
  if (Number.isNaN(d.getTime())) return todayISODate();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function defaultDueDateFromPaymentTerms(
  invoiceDate: string,
  paymentTermsDays: number | null | undefined,
): string {
  const days =
    paymentTermsDays != null &&
    Number.isFinite(Number(paymentTermsDays)) &&
    Number(paymentTermsDays) > 0
      ? Number(paymentTermsDays)
      : 30;
  return addDaysISODate(invoiceDate || todayISODate(), days);
}

export function computeInvoiceTotals(items: InvoiceLineFormRow[]): {
  subtotal: number;
  taxAmount: number;
  total: number;
} {
  const subtotal = items.reduce(
    (s, it) => s + it.quantity * it.unit_price,
    0,
  );
  const taxAmount = items.reduce((s, it) => {
    const line = it.quantity * it.unit_price;
    return s + (line * (it.tax_rate || 0)) / 100;
  }, 0);
  return { subtotal, taxAmount, total: subtotal + taxAmount };
}

export function getCreateInvoiceValidationErrors(
  formData: {
    tenant_id?: string | null;
    invoice_date?: string;
    due_date?: string;
  },
  items: InvoiceLineFormRow[],
  opts: { isEdit: boolean },
): Record<string, string> {
  const err: Record<string, string> = {};
  if (!opts.isEdit && !formData.tenant_id?.trim()) {
    err.tenant_id = "Select a company (tenant).";
  }
  if (!formData.invoice_date?.trim()) {
    err.invoice_date = "Invoice date is required";
  }
  if (!formData.due_date?.trim()) {
    err.due_date = "Due date is required";
  }
  if (items.length === 0) {
    err.items = "At least one line item is required";
  } else {
    const bad = items.filter(
      (it) =>
        it.product_id == null ||
        it.quantity <= 0 ||
        it.unit_price < 0 ||
        Number.isNaN(it.quantity),
    );
    if (bad.length > 0) {
      err.items =
        "Each line needs a product, positive quantity, and a valid unit price.";
    }
  }
  return err;
}

export function invoiceHasPayments(invoice: Invoice | undefined): boolean {
  if (!invoice) return false;
  const paid = Number(invoice.paid_amount ?? 0);
  const st = invoice.status ?? "";
  const payments = invoice.payments;
  const hasPay =
    Array.isArray(payments) &&
    payments.some(
      (p) =>
        (p as { status?: string }).status === "completed" ||
        (p as { status?: string }).status === "partially_paid",
    );
  return (
    paid > 0 ||
    st === "paid" ||
    st === "partially_paid" ||
    Boolean(hasPay)
  );
}

export function mapInvoiceItemsToFormRows(
  items: InvoiceItem[] | undefined,
): InvoiceLineFormRow[] {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((it) => {
    const tr = it.tax_rate ?? 0;
    return {
      product_id: it.product_id,
      quantity: it.quantity,
      unit_price: it.unit_price,
      tax_rate: tr,
      description: it.description ?? "",
    };
  });
}

export function toCreateInvoiceItems(
  items: InvoiceLineFormRow[],
): CreateInvoiceItemData[] {
  return items.map((it) => ({
    product_id: it.product_id,
    quantity: it.quantity,
    unit_price: it.unit_price,
    vat_rate: it.tax_rate,
    tax_rate: it.tax_rate,
    description: it.description.trim() || undefined,
  }));
}

export function effectiveUnitPrice(p: PricedProduct): number {
  const e = p.effective_price;
  const s = p.selling_price;
  const b = p.base_price;
  if (typeof e === "number" && Number.isFinite(e)) return e;
  if (typeof s === "number" && Number.isFinite(s)) return s;
  if (typeof b === "number" && Number.isFinite(b)) return b;
  return 0;
}

export function descriptionForProduct(p: PricedProduct): string {
  const custom = p.company_pricing?.custom_description;
  if (custom != null && String(custom).trim() !== "") return String(custom);
  return p.description || p.name || "";
}

export function resolveTaxRateForLine(
  product: PricedProduct | undefined,
  invoiceProfile: {
    vat_rate?: number | string | null;
    vat_exemption?: boolean | null;
  } | null | undefined,
): number {
  if (!invoiceProfile) {
    const vr = product?.vat_rate;
    return typeof vr === "number" && vr > 0 ? vr : 0;
  }
  if (invoiceProfile.vat_exemption) return 0;
  const pr = product?.vat_rate;
  if (typeof pr === "number" && pr > 0) return pr;
  const raw = invoiceProfile.vat_rate;
  const n = raw == null ? NaN : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export type CreditLimitSummary = {
  creditLimit: number;
  outstandingTotal: number;
  newInvoiceTotal: number;
  totalAfterNewInvoice: number;
  availableCredit: number;
  willExceed: boolean;
  exceedBy: number;
  currency: string;
};

export function computeCreditLimitSummary(
  invoiceProfile: { credit_limit?: number | string | null; currency?: string | null } | null | undefined,
  outstandingRows: Record<string, unknown>[],
  newInvoiceTotal: number,
  isEdit: boolean,
  currentInvoiceId: number | string | undefined,
  crmCompanyId: string | null | undefined,
): CreditLimitSummary | null {
  if (!invoiceProfile) return null;
  const creditLimit = Number.parseFloat(String(invoiceProfile.credit_limit ?? 0));
  if (!Number.isFinite(creditLimit) || creditLimit <= 0) return null;
  const list = outstandingRows || [];
  const outstandingInvoices = list.filter((inv) => {
    const row = inv as {
      id?: number;
      status?: string;
      crm_company_id?: string | null;
      outstanding_amount?: number;
      total_amount?: number;
      paid_amount?: number;
    };
    const st = row.status ?? "";
    const ok = ["pending", "sent", "partially_paid", "overdue"].includes(st);
    const isCurrent = isEdit && currentInvoiceId != null && row.id === currentInvoiceId;
    const matchCrm =
      crmCompanyId == null ||
      String(row.crm_company_id ?? "") === String(crmCompanyId);
    return ok && !isCurrent && matchCrm;
  });
  const outstandingTotal = outstandingInvoices.reduce((sum, inv) => {
    const row = inv as {
      outstanding_amount?: number;
      total_amount?: number;
      paid_amount?: number;
    };
    const o =
      row.outstanding_amount ??
      (Number(row.total_amount ?? 0) - Number(row.paid_amount ?? 0));
    return sum + (Number.isFinite(o) ? o : 0);
  }, 0);
  const totalAfterNewInvoice = outstandingTotal + newInvoiceTotal;
  const willExceed = totalAfterNewInvoice > creditLimit;
  return {
    creditLimit,
    outstandingTotal,
    newInvoiceTotal,
    totalAfterNewInvoice,
    availableCredit: creditLimit - outstandingTotal,
    willExceed,
    exceedBy: willExceed ? totalAfterNewInvoice - creditLimit : 0,
    currency: invoiceProfile.currency?.trim() || "USD",
  };
}
