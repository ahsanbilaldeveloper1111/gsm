const LIMITS = new Set([10, 20, 25, 50, 100]);

/** Valid `order[column]` values for `GET /vendors` (§15.4). */
const SORT_FIELDS = new Set([
  "name",
  "email",
  "phone",
  "created_at",
  "updated_at",
]);

function normalizeSortField(raw: string): string {
  const t = raw.trim() || "name";
  return SORT_FIELDS.has(t) ? t : "name";
}

export type VendorListUrlState = {
  page: number;
  limit: number;
  search: string;
  sort_field: string;
  sort_direction: "asc" | "desc";
  filter_email: string;
  filter_phone: string;
};

export function defaultVendorListUrlState(): VendorListUrlState {
  return {
    page: 1,
    limit: 20,
    search: "",
    sort_field: "name",
    sort_direction: "asc",
    filter_email: "",
    filter_phone: "",
  };
}

function parseLimit(raw: string | null): number {
  const n = Number(raw);
  return LIMITS.has(n) ? n : 20;
}

export function parseVendorListSearchParams(
  sp: URLSearchParams,
): VendorListUrlState {
  const dirRaw = sp.get("sort_direction");
  const sort_direction: "asc" | "desc" =
    dirRaw === "desc" ? "desc" : "asc";
  return {
    page: Math.max(1, Number(sp.get("page")) || 1),
    limit: parseLimit(sp.get("per_page")),
    search: sp.get("search") ?? "",
    sort_field: normalizeSortField(sp.get("sort_field") ?? ""),
    sort_direction,
    filter_email: sp.get("filter_email") ?? "",
    filter_phone: sp.get("filter_phone") ?? "",
  };
}

export function buildVendorListSearchParams(
  s: VendorListUrlState,
  opts?: { searchOverride?: string },
): URLSearchParams {
  const q = new URLSearchParams();
  const search = opts?.searchOverride ?? s.search;
  if (search.trim()) q.set("search", search.trim());
  if (s.page > 1) q.set("page", String(s.page));
  if (s.limit !== 20) q.set("per_page", String(s.limit));
  if (s.sort_field !== "name") q.set("sort_field", s.sort_field);
  if (s.sort_direction !== "asc") q.set("sort_direction", s.sort_direction);
  if (s.filter_email.trim()) q.set("filter_email", s.filter_email.trim());
  if (s.filter_phone.trim()) q.set("filter_phone", s.filter_phone.trim());
  return q;
}
