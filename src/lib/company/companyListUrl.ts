const LIMITS = new Set([10, 20, 25, 50, 100]);

/** Typical `order[column]` values for `GET /company`. */
const SORT_FIELDS = new Set([
  "name",
  "email",
  "phone",
  "country",
  "created_at",
  "updated_at",
  "credit_limit",
  "outstanding_amount",
]);

function normalizeSortField(raw: string): string {
  const t = raw.trim() || "name";
  return SORT_FIELDS.has(t) ? t : "name";
}

export type CompanyListUrlState = {
  page: number;
  limit: number;
  search: string;
  sort_field: string;
  sort_direction: "asc" | "desc";
  tenant_id: string;
  vendor_id: string;
};

export function defaultCompanyListUrlState(): CompanyListUrlState {
  return {
    page: 1,
    limit: 20,
    search: "",
    sort_field: "name",
    sort_direction: "asc",
    tenant_id: "",
    vendor_id: "",
  };
}

function parseLimit(raw: string | null): number {
  const n = Number(raw);
  return LIMITS.has(n) ? n : 20;
}

export function parseCompanyListSearchParams(
  sp: URLSearchParams,
): CompanyListUrlState {
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
    vendor_id: sp.get("vendor_id")?.trim() ?? "",
  };
}

export function buildCompanyListSearchParams(
  s: CompanyListUrlState,
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
  if (s.vendor_id.trim()) q.set("vendor_id", s.vendor_id.trim());
  return q;
}
