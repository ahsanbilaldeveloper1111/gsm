"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { QueryParams } from "@/lib/api/http";
import type { IndexProductCategoryParams } from "@/models/ProductCategory";
import { productCategoryService } from "@/services/product-categories.service";

export function useProductCategories(
  params?: IndexProductCategoryParams,
  options?: { enabled?: boolean },
) {
  const auth = useAuthQueryEnabled();
  const enabled =
    auth && (options?.enabled === undefined ? true : options.enabled);
  return useQuery({
    queryKey: queryKeys.productCategories.list(
      (params as Record<string, unknown> | undefined) ?? null,
    ),
    queryFn: () =>
      productCategoryService.list(params as QueryParams | undefined),
    enabled,
  });
}
