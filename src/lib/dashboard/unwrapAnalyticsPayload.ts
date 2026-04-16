import { normalizeTelecomDataResponse } from "@/lib/api/telecomResponse";

/**
 * Billing analytics endpoints return `ApiSuccessResponse<T>`; unwrap `data` for UI.
 */
export function unwrapApiSuccessData<T>(payload: unknown): T | null {
  if (payload == null || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;
  const ok =
    o.success === true ||
    o.success === 1 ||
    o.success === "true" ||
    o.success === "1";
  if (ok && o.data != null) return o.data as T;
  return null;
}

/**
 * `GET /api/dashboard` may return Laravel `success` + `data`, or telecom `{ code, data }`.
 */
export function unwrapDashboardApiPayload(payload: unknown): unknown {
  if (payload == null) return null;
  const billing = unwrapApiSuccessData<unknown>(payload);
  if (billing != null) return billing;
  try {
    return normalizeTelecomDataResponse(payload);
  } catch {
    return payload;
  }
}

export function toFiniteNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * Backend fields that should be arrays sometimes arrive as objects; using them
 * with `.map` / `.slice` would crash the dashboard.
 */
export function asArray<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/**
 * Normalizes list endpoints (`data` may be an array or wrapped in `data` /
 * `items` / `rows`).
 */
export function coerceAnalyticsRowList(v: unknown): Record<string, unknown>[] {
  if (Array.isArray(v)) {
    return v.filter(
      (x): x is Record<string, unknown> =>
        x != null && typeof x === "object" && !Array.isArray(x),
    );
  }
  if (v != null && typeof v === "object") {
    const o = v as Record<string, unknown>;
    for (const k of [
      "data",
      "items",
      "rows",
      "results",
      "products",
      "companies",
    ] as const) {
      const inner = o[k];
      const rows = coerceAnalyticsRowList(inner);
      if (rows.length > 0) return rows;
    }
  }
  return [];
}
