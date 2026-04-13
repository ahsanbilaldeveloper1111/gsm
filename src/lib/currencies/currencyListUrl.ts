const LIMITS = new Set([10, 20, 25, 50, 100]);

/** Valid `sort_field` values for `GET /currencies` index. */
const SORT_FIELDS = new Set([
  "code",
  "name",
  "exchange_rate",
  "is_base_currency",
]);

function normalizeSortField(raw: string): string {
  const t = raw.trim() || "code";
  return SORT_FIELDS.has(t) ? t : "code";
}

export type CurrencyListUrlState = {
  page: number;
  limit: number;
  search: string;
  sort_field: string;
  sort_direction: "asc" | "desc";
};

export function defaultCurrencyListUrlState(): CurrencyListUrlState {
  return {
    page: 1,
    limit: 20,
    search: "",
    sort_field: "code",
    sort_direction: "asc",
  };
}

function parseLimit(sp: URLSearchParams): number {
  const fromLimit = Number(sp.get("limit"));
  const fromPerPage = Number(sp.get("per_page"));
  const n = Number.isFinite(fromLimit) && fromLimit > 0 ? fromLimit : fromPerPage;
  return LIMITS.has(n) ? n : 20;
}

export function parseCurrencyListSearchParams(
  sp: URLSearchParams,
): CurrencyListUrlState {
  const dirRaw = sp.get("sort_direction");
  const sort_direction: "asc" | "desc" = dirRaw === "desc" ? "desc" : "asc";
  return {
    page: Math.max(1, Number(sp.get("page")) || 1),
    limit: parseLimit(sp),
    search: sp.get("search") ?? "",
    sort_field: normalizeSortField(sp.get("sort_field") ?? ""),
    sort_direction,
  };
}

export function buildCurrencyListSearchParams(
  s: CurrencyListUrlState,
  opts?: { searchOverride?: string },
): URLSearchParams {
  const q = new URLSearchParams();
  const search = opts?.searchOverride ?? s.search;
  if (search.trim()) q.set("search", search.trim());
  if (s.page > 1) q.set("page", String(s.page));
  if (s.limit !== 20) q.set("limit", String(s.limit));
  if (s.sort_field !== "code") q.set("sort_field", s.sort_field);
  if (s.sort_direction !== "asc") q.set("sort_direction", s.sort_direction);
  return q;
}
