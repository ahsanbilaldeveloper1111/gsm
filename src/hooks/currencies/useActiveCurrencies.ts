"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { ApiSuccessResponse } from "@/lib/api/types";
import type { Currency } from "@/models/Currency";
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
