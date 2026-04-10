"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexCurrencyParams } from "@/models/Currency";
import { currencyService } from "@/services/currencies.service";

export function useCurrencies(params?: IndexCurrencyParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.currencies.index(
      (params as Record<string, unknown> | undefined) ?? null,
    ),
    queryFn: () => currencyService.list(params),
    enabled,
  });
}
