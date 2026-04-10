"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { ApiSuccessResponse } from "@/lib/api/types";
import type { Currency } from "@/models/Currency";
import { currencyService } from "@/services/currencies.service";

export function useBaseCurrency() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.currencies.base(),
    queryFn: () => currencyService.base(),
    enabled,
  });
}

export function baseCurrencyFromResponse(
  res: ApiSuccessResponse<Currency> | undefined,
): Currency | undefined {
  const d = res?.data;
  return d && typeof d === "object" ? d : undefined;
}
