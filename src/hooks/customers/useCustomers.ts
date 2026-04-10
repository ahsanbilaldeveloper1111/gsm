"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexCustomerParams } from "@/models/Customer";
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
