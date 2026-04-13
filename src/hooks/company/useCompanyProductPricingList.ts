"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/queryKeys";
import { companyService } from "@/services/company.service";

/** Shared shape for company and customer product-pricing list queries. */
export type CompanyProductPricingListParams = {
  page?: number;
  limit?: number;
  load_product?: boolean;
  tenant_id?: string;
  search?: string;
  "order[column]"?: string;
  "order[dir]"?: "asc" | "desc";
};

export function useCompanyProductPricingList(
  pathCompanyId: string | null | undefined,
  params: CompanyProductPricingListParams,
  options?: { enabled?: boolean },
) {
  const auth = useAuthQueryEnabled();
  const enabled =
    auth &&
    pathCompanyId != null &&
    String(pathCompanyId).trim() !== "" &&
    (options?.enabled !== false);

  return useQuery({
    queryKey: queryKeys.company.productPricing(
      pathCompanyId ?? null,
      params as Record<string, unknown>,
    ),
    queryFn: () =>
      companyService.productPricingList(
        pathCompanyId as string,
        params as QueryParams,
      ),
    enabled,
  });
}
