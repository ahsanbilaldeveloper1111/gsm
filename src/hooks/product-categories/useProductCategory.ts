"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/queryKeys";
import { productCategoryService } from "@/services/product-categories.service";

export function useProductCategory(
  id: number | string | null | undefined,
  params?: QueryParams,
) {
  const auth = useAuthQueryEnabled();
  const enabled = auth && id != null && id !== "";
  return useQuery({
    queryKey: queryKeys.productCategories.detail(id ?? null),
    queryFn: () => productCategoryService.show(id as number | string, params),
    enabled,
  });
}
