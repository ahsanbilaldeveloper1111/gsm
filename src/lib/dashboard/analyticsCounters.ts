import { toFiniteNumber } from "@/lib/dashboard/unwrapAnalyticsPayload";

/** Prefer readable labels for known backend keys. */
const LABEL_OVERRIDES: Record<string, string> = {
  total_company_count: "Total companies",
  total_customer_count: "Total customers",
};

function humanizeKey(key: string): string {
  const base = key.replace(/_count$/i, "").replace(/_/g, " ");
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

export type CounterMetricEntry = {
  key: string;
  label: string;
  value: number;
  /** How to format the value in metric cards (default: integer counts). */
  valueStyle?: "integer" | "currency";
};

/**
 * Builds counter cards from `/analytics/counters` `data` object.
 * Includes every top-level numeric field so new API fields appear automatically.
 */
export function counterMetricEntries(
  data: Record<string, unknown> | null,
): CounterMetricEntry[] {
  if (data == null) return [];
  const out: CounterMetricEntry[] = [];
  for (const [key, raw] of Object.entries(data)) {
    if (typeof raw === "boolean") continue;
    if (typeof raw === "object" && raw !== null) continue;
    const value = toFiniteNumber(raw);
    if (raw === null || raw === undefined) continue;
    const label = LABEL_OVERRIDES[key] ?? humanizeKey(key);
    out.push({ key, label, value });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}
