"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import type { QueryParams } from "@/lib/api/http";
import { productCategoryService } from "@/services/product-categories.service";

export function useProductCategories(params?: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.productCategories.list(params ?? null),
    queryFn: () => productCategoryService.list(params),
    enabled,
  });
}
