"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexPaymentParams } from "@/models/Payment";
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
