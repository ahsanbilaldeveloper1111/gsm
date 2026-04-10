"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import type { IndexCurrencyParams } from "@/models/currency";
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
