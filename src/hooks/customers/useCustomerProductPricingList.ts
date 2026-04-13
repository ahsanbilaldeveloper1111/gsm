"use client";

import type { CompanyProductPricingListParams } from "@/hooks/company/useCompanyProductPricingList";
import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/queryKeys";
import { customerService } from "@/services/customers.service";

export function useCustomerProductPricingList(
  customerPathId: string | null | undefined,
  params: CompanyProductPricingListParams,
  options?: { enabled?: boolean },
) {
  const auth = useAuthQueryEnabled();
  const enabled =
    auth &&
    customerPathId != null &&
    String(customerPathId).trim() !== "" &&
    (options?.enabled !== false);

  return useQuery({
    queryKey: queryKeys.customers.productPricing(
      customerPathId ?? null,
      params as Record<string, unknown>,
    ),
    queryFn: () =>
      customerService.productPricingList(
        customerPathId as string,
        params as QueryParams,
      ),
    enabled,
  });
}
