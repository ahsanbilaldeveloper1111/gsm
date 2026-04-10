"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import type { IndexCustomerParams } from "@/models/customer";
import { customerService } from "@/services/customers.service";

export function useCustomers(params?: IndexCustomerParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.customers.list(
      (params as Record<string, unknown> | undefined) ?? null,
    ),
    queryFn: () => customerService.list(params),
    enabled,
  });
}
