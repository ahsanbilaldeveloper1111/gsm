"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import type { ApiSuccessResponse } from "@/lib/api/types";
import type { Currency } from "@/models/currency";
import { currencyService } from "@/services/currencies.service";

export function useActiveCurrencies() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.currencies.active(),
    queryFn: () => currencyService.active(),
    enabled,
  });
}

export function currenciesFromResponse(
  res: ApiSuccessResponse<Currency[]> | undefined,
): Currency[] {
  const d = res?.data;
  return Array.isArray(d) ? d : [];
}
