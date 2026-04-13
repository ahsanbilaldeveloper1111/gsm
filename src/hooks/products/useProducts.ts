"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexProductParams } from "@/models/Product";
import { productService } from "@/services/products.service";

export function useProducts(
  params?: IndexProductParams,
  options?: { enabled?: boolean },
) {
  const auth = useAuthQueryEnabled();
  const enabled =
    auth && (options?.enabled === undefined ? true : options.enabled);
  return useQuery({
    queryKey: queryKeys.products.list(
      (params as Record<string, unknown> | undefined) ?? null,
    ),
    queryFn: () => productService.list(params as QueryParams | undefined),
    enabled,
  });
}
