"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/query-keys";
import { vendorService } from "@/services/vendors.service";

export function useVendor(
  id: number | string | null | undefined,
  params?: QueryParams,
) {
  const auth = useAuthQueryEnabled();
  const enabled = auth && id != null && id !== "";
  return useQuery({
    queryKey: queryKeys.vendors.detail(id ?? null),
    queryFn: () => vendorService.show(id as number | string, params),
    enabled,
  });
}
