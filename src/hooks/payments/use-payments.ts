"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import type { IndexPaymentParams } from "@/models/payment";
import { paymentService } from "@/services/payments.service";

export function usePayments(params?: IndexPaymentParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.payments.list(
      (params as Record<string, unknown> | undefined) ?? null,
    ),
    queryFn: () => paymentService.list(params),
    enabled,
  });
}
