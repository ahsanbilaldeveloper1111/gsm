"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexVendorParams } from "@/models/Vendor";
import { vendorService } from "@/services/vendors.service";

export function useVendors(
  params?: IndexVendorParams,
  options?: { enabled?: boolean },
) {
  const auth = useAuthQueryEnabled();
  const enabled =
    auth && (options?.enabled === undefined ? true : options.enabled);
  return useQuery({
    queryKey: queryKeys.vendors.list(
      (params as Record<string, unknown> | undefined) ?? null,
    ),
    queryFn: () => vendorService.list(params),
    enabled,
  });
}
