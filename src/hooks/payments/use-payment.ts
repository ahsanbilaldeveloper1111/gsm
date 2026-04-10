"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/query-keys";
import { paymentService } from "@/services/payments.service";

export function usePayment(
  id: number | string | null | undefined,
  params?: QueryParams,
) {
  const auth = useAuthQueryEnabled();
  const enabled = auth && id != null && id !== "";
  return useQuery({
    queryKey: queryKeys.payments.detail(id ?? null),
    queryFn: () => paymentService.show(id as number | string, params),
    enabled,
  });
}
