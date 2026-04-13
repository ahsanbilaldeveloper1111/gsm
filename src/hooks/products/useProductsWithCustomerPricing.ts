"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/queryKeys";
import { productService } from "@/services/products.service";

/**
 * `GET /products/with-customer-pricing` — pass CRM company id string when the
 * backend expects `crm_company_id` (matches customer invoice flows).
 */
export function useProductsWithCustomerPricing(
  crmCompanyId: string | null | undefined,
) {
  const auth = useAuthQueryEnabled();
  const id = crmCompanyId != null ? String(crmCompanyId).trim() : "";
  const enabled = auth && id !== "";
  return useQuery({
    queryKey: queryKeys.products.withCustomerPricing(crmCompanyId ?? null),
    queryFn: () =>
      productService.withCustomerPricing({
        crm_company_id: id,
        load_product: true,
      } as QueryParams),
    enabled,
  });
}
