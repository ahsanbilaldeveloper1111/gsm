"use client";

import { useQuery } from "@tanstack/react-query";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/query-keys";
import { publicApiService } from "@/services/public-api.service";

/** Public invoice payment page — no JWT. */
export function usePublicInvoicePay(
  token: string | null | undefined,
  params?: QueryParams,
) {
  return useQuery({
    queryKey: queryKeys.public.invoicePay(token ?? null),
    queryFn: () =>
      publicApiService.invoicePayGet(token as string, params),
    enabled: !!token,
  });
}
