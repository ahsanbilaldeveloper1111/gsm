"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/query-keys";
import { paymentService } from "@/services/payments.service";

export function usePaymentIntentStatus(
  paymentIntentId: string | null | undefined,
  params?: QueryParams,
) {
  const auth = useAuthQueryEnabled();
  const enabled = auth && !!paymentIntentId;
  return useQuery({
    queryKey: queryKeys.payments.status(paymentIntentId ?? null),
    queryFn: () =>
      paymentService.status(paymentIntentId as string, params),
    enabled,
  });
}
