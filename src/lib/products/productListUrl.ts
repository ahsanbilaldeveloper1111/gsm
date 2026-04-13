const LIMITS = new Set([10, 20, 25, 50, 100]);

/** Typical `order[column]` values for `GET /products`. */
const SORT_FIELDS = new Set([
  "name",
  "sku",
  "base_price",
  "created_at",
  "updated_at",
  "is_service",
]);

function normalizeSortField(raw: string): string {
  const t = raw.trim() || "created_at";
  return SORT_FIELDS.has(t) ? t : "created_at";
}

export type ProductListUrlState = {
  page: number;
  limit: number;
  search: string;
  category_id: number | null;
  sort_field: string;
  sort_direction: "asc" | "desc";
};

export function defaultProductListUrlState(): ProductListUrlState {
  return {
    page: 1,
    limit: 20,
    search: "",
    category_id: null,
    sort_field: "created_at",
    sort_direction: "desc",
  };
}

function parseLimit(raw: string | null): number {
  const n = Number(raw);
  return LIMITS.has(n) ? n : 20;
}

function parseCategoryId(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function parseProductListSearchParams(
  sp: URLSearchParams,
): ProductListUrlState {
  const dirRaw = sp.get("sort_direction");
  const sort_direction: "asc" | "desc" =
    dirRaw === "asc" ? "asc" : "desc";
  return {
    page: Math.max(1, Number(sp.get("page")) || 1),
    limit: parseLimit(sp.get("per_page")),
    search: sp.get("search") ?? "",
    category_id: parseCategoryId(sp.get("category_id")),
    sort_field: normalizeSortField(sp.get("sort_field") ?? ""),
    sort_direction,
  };
}

export function buildProductListSearchParams(
  s: ProductListUrlState,
  opts?: { searchOverride?: string },
): URLSearchParams {
  const q = new URLSearchParams();
  const search = opts?.searchOverride ?? s.search;
  if (search.trim()) q.set("search", search.trim());
  if (s.page > 1) q.set("page", String(s.page));
  if (s.limit !== 20) q.set("per_page", String(s.limit));
  if (s.category_id != null) q.set("category_id", String(s.category_id));
  if (s.sort_field !== "created_at") q.set("sort_field", s.sort_field);
  if (s.sort_direction !== "desc") q.set("sort_direction", s.sort_direction);
  return q;
}
