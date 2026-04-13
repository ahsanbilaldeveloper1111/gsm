import type { Country } from "world-countries";
import countries from "world-countries";

export type WorldCurrencyMeta = {
  name?: string;
  symbol?: string;
};

/**
 * ISO 4217 codes aggregated from `world-countries` currency data (name/symbol hints).
 */
export function buildWorldCurrencyMap(): Map<string, WorldCurrencyMeta> {
  const map = new Map<string, WorldCurrencyMeta>();

  for (const country of countries as Country[]) {
    const curr = country?.currencies;
    if (!curr || typeof curr !== "object") continue;

    for (const [codeRaw, details] of Object.entries(curr)) {
      const code = String(codeRaw).toUpperCase();
      const name =
        details && typeof details === "object" && "name" in details
          ? String((details as { name?: string }).name ?? "")
          : undefined;
      const symbol =
        details && typeof details === "object" && "symbol" in details
          ? String((details as { symbol?: string }).symbol ?? "")
          : undefined;

      if (!map.has(code)) {
        map.set(code, {
          name: name || undefined,
          symbol: symbol || undefined,
        });
        continue;
      }
      const prev = map.get(code) ?? {};
      map.set(code, {
        name: prev.name || name || undefined,
        symbol: prev.symbol || symbol || undefined,
      });
    }
  }

  return map;
}

export function worldCurrencyDropdownRows(
  map: Map<string, WorldCurrencyMeta>,
): { code: string; label: string }[] {
  return Array.from(map.entries())
    .map(([code, meta]) => ({
      code,
      label: [
        code,
        meta?.name ? ` - ${meta.name}` : "",
        meta?.symbol ? ` (${meta.symbol})` : "",
      ].join(""),
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}
