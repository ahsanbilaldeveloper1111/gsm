"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import type { ApiSuccessResponse } from "@/lib/api/types";
import type { Currency } from "@/models/currency";
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
