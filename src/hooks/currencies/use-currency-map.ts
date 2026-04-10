"use client";

import { useMemo } from "react";
import { buildCurrencyMap } from "@/lib/currency";
import type { Currency } from "@/models/currency";
import {
  baseCurrencyFromResponse,
  useBaseCurrency,
} from "@/hooks/currencies/use-base-currency";
import {
  currenciesFromResponse,
  useActiveCurrencies,
} from "@/hooks/currencies/use-active-currencies";

/** Code → currency row, for FX conversion (active list + base row). */
export function useCurrencyMap(): Map<string, Currency> {
  const activeQ = useActiveCurrencies();
  const baseQ = useBaseCurrency();
  return useMemo(() => {
    const active = currenciesFromResponse(activeQ.data);
    const base = baseCurrencyFromResponse(baseQ.data);
    return buildCurrencyMap(active, base);
  }, [activeQ.data, baseQ.data]);
}
