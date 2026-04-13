"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/queryKeys";
import { productService } from "@/services/products.service";

/** `GET /products/with-company-pricing` scoped to a billing company tenant id. */
export function useProductsWithCompanyPricing(
  tenantId: string | null | undefined,
) {
  const auth = useAuthQueryEnabled();
  const tid = tenantId != null ? String(tenantId).trim() : "";
  const enabled = auth && tid !== "";
  return useQuery({
    queryKey: queryKeys.products.withCompanyPricing(tenantId ?? null),
    queryFn: () =>
      productService.withCompanyPricing({
        tenant_id: tid,
        load_product: true,
      } as QueryParams),
    enabled,
  });
}
