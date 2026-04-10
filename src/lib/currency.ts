import type { Currency } from "@/models/currency";

const COMMON_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  CHF: "CHF",
  CNY: "¥",
  INR: "₹",
  BRL: "R$",
};

function toNumeric(
  amount: number | string | null | undefined,
): { value: number; ok: boolean } {
  if (typeof amount === "number") {
    return Number.isFinite(amount) ? { value: amount, ok: true } : { value: 0, ok: false };
  }
  const n = Number.parseFloat(String(amount ?? "").trim() || "0");
  return Number.isNaN(n) ? { value: 0, ok: false } : { value: n, ok: true };
}

/**
 * Format a monetary value with `Intl` (currency style).
 * `currencyCode` should be a valid ISO 4217 code (e.g. USD, AED).
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currencyCode: string = "USD",
  locale: string = "en-US",
): string {
  const code = String(currencyCode || "USD").toUpperCase();
  const { value, ok } = toNumeric(amount);
  if (!ok) {
    return `${code} 0.00`;
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${code} ${value.toFixed(2)}`;
  }
}

/** Plain numeric formatting (no currency symbol). */
export function formatNumber(
  amount: number | string | null | undefined,
  decimals: number = 2,
  locale: string = "en-US",
): string {
  const { value, ok } = toNumeric(amount);
  if (!ok) {
    return (0).toFixed(decimals);
  }
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return value.toFixed(decimals);
  }
}

/** Strip non-numeric characters and parse (for inputs). */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d.-]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Rough symbol for common ISO codes; falls back to the code itself. */
export function getCurrencySymbol(currencyCode: string): string {
  const code = String(currencyCode || "").toUpperCase();
  return COMMON_SYMBOLS[code] ?? code;
}

/**
 * Cross-convert using two API `exchange_rate` values in the **same convention**:
 * intermediate value in base = `amount / fromRate`, then target = `× toRate`.
 * If your backend uses a different definition, adjust here once.
 */
export function convertCurrency(
  amount: number,
  fromRate: number,
  toRate: number,
): number {
  if (!Number.isFinite(amount)) return 0;
  const f = fromRate > 0 ? fromRate : 1;
  const t = toRate > 0 ? toRate : 1;
  const baseAmount = amount / f;
  return baseAmount * t;
}

export function buildCurrencyMap(
  active: Currency[],
  base: Currency | undefined,
): Map<string, Currency> {
  const map = new Map<string, Currency>();
  for (const c of active) {
    const code = String(c.code || "").toUpperCase();
    if (code) map.set(code, c);
  }
  if (base?.code) {
    map.set(String(base.code).toUpperCase(), base);
  }
  return map;
}
