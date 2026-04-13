import type { InvoiceStatus } from "@/models/Invoice";

const LIMITS = new Set([10, 20, 25, 50, 100]);

export type InvoiceListUrlState = {
  page: number;
  limit: number;
  search: string;
  status: InvoiceStatus | "";
  tenant_id: string;
  vendor_id: string;
  crm_company_id: string;
  date_from: string;
  date_to: string;
  column: string;
  dir: "asc" | "desc";
  payment_status: string;
  crm_company_not_null: boolean;
  display_currency: string;
};

export const defaultInvoiceListUrlState = (): InvoiceListUrlState => ({
  page: 1,
  limit: 20,
  search: "",
  status: "",
  tenant_id: "",
  vendor_id: "",
  crm_company_id: "",
  date_from: "",
  date_to: "",
  column: "invoice_date",
  dir: "desc",
  payment_status: "",
  crm_company_not_null: false,
  display_currency: "",
});

export function parseInvoiceListSearchParams(
  sp: URLSearchParams,
): InvoiceListUrlState {
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const lim = Number(sp.get("limit")) || 20;
  const limit = LIMITS.has(lim) ? lim : 20;
  const dirRaw = sp.get("dir");
  const dir: "asc" | "desc" = dirRaw === "asc" ? "asc" : "desc";
  const column = sp.get("column")?.trim() || "invoice_date";
  return {
    page,
    limit,
    search: sp.get("search") ?? "",
    status: (sp.get("status") as InvoiceStatus) || "",
    tenant_id: sp.get("tenant_id") ?? sp.get("company_id") ?? "",
    vendor_id: sp.get("vendor_id") ?? "",
    crm_company_id: sp.get("crm_company_id") ?? "",
    date_from: sp.get("date_from") ?? "",
    date_to: sp.get("date_to") ?? "",
    column,
    dir,
    payment_status: sp.get("payment_status") ?? "",
    crm_company_not_null: sp.get("crm_company_not_null") === "1",
    display_currency: sp.get("currency") ?? "",
  };
}

/** Build query string for list URL (bookmark / share). */
export function buildInvoiceListSearchParams(
  s: InvoiceListUrlState,
  opts?: { searchOverride?: string },
): URLSearchParams {
  const q = new URLSearchParams();
  const search = opts?.searchOverride ?? s.search;
  q.set("page", String(s.page));
  q.set("limit", String(s.limit));
  if (search.trim()) q.set("search", search.trim());
  if (s.status) q.set("status", s.status);
  if (s.tenant_id.trim()) q.set("tenant_id", s.tenant_id.trim());
  if (s.vendor_id.trim()) q.set("vendor_id", s.vendor_id.trim());
  if (s.crm_company_id.trim()) q.set("crm_company_id", s.crm_company_id.trim());
  if (s.date_from) q.set("date_from", s.date_from);
  if (s.date_to) q.set("date_to", s.date_to);
  if (s.payment_status.trim()) q.set("payment_status", s.payment_status.trim());
  if (s.crm_company_not_null) q.set("crm_company_not_null", "1");
  if (s.display_currency.trim()) q.set("currency", s.display_currency.trim().toUpperCase());
  q.set("column", s.column);
  q.set("dir", s.dir);
  return q;
}
