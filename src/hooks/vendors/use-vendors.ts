"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import type { QueryParams } from "@/lib/api/http";
import { vendorService } from "@/services/vendors.service";

export function useVendors(params?: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.vendors.list(params ?? null),
    queryFn: () => vendorService.list(params),
    enabled,
  });
}
