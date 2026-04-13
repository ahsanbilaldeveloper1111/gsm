const LIMITS = new Set([10, 20, 25, 50, 100]);

const SORT_FIELDS = new Set([
  "name",
  "email",
  "phone",
  "crm_company_id",
  "tenant_id",
  "created_at",
  "updated_at",
]);

function normalizeSortField(raw: string): string {
  const t = raw.trim() || "name";
  return SORT_FIELDS.has(t) ? t : "name";
}

export type CustomerListUrlState = {
  page: number;
  limit: number;
  search: string;
  sort_field: string;
  sort_direction: "asc" | "desc";
  tenant_id: string;
  crm_company_id: string;
  vendor_id: string;
};

export function defaultCustomerListUrlState(): CustomerListUrlState {
  return {
    page: 1,
    limit: 20,
    search: "",
    sort_field: "name",
    sort_direction: "asc",
    tenant_id: "",
    crm_company_id: "",
    vendor_id: "",
  };
}

function parseLimit(raw: string | null): number {
  const n = Number(raw);
  return LIMITS.has(n) ? n : 20;
}

export function parseCustomerListSearchParams(
  sp: URLSearchParams,
): CustomerListUrlState {
  const dirRaw = sp.get("sort_direction");
  const sort_direction: "asc" | "desc" =
    dirRaw === "desc" ? "desc" : "asc";
  return {
    page: Math.max(1, Number(sp.get("page")) || 1),
    limit: parseLimit(sp.get("per_page")),
    search: sp.get("search") ?? "",
    sort_field: normalizeSortField(sp.get("sort_field") ?? ""),
    sort_direction,
    tenant_id: sp.get("tenant_id") ?? "",
    crm_company_id: sp.get("crm_company_id")?.trim() ?? "",
    vendor_id: sp.get("vendor_id")?.trim() ?? "",
  };
}

export function buildCustomerListSearchParams(
  s: CustomerListUrlState,
  opts?: { searchOverride?: string },
): URLSearchParams {
  const q = new URLSearchParams();
  const search = opts?.searchOverride ?? s.search;
  if (search.trim()) q.set("search", search.trim());
  if (s.page > 1) q.set("page", String(s.page));
  if (s.limit !== 20) q.set("per_page", String(s.limit));
  if (s.sort_field !== "name") q.set("sort_field", s.sort_field);
  if (s.sort_direction !== "asc") q.set("sort_direction", s.sort_direction);
  if (s.tenant_id.trim()) q.set("tenant_id", s.tenant_id.trim());
  if (s.crm_company_id.trim()) q.set("crm_company_id", s.crm_company_id.trim());
  if (s.vendor_id.trim()) q.set("vendor_id", s.vendor_id.trim());
  return q;
}
