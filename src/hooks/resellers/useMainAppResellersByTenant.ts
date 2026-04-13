"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/queryKeys";
import { resellerService } from "@/services/resellers.service";

export function useMainAppResellersByTenant(
  tenantId: string | number | null | undefined,
  params?: QueryParams,
  options?: { enabled?: boolean },
) {
  const auth = useAuthQueryEnabled();
  const tid = tenantId != null ? String(tenantId).trim() : "";
  const enabled =
    auth &&
    tid !== "" &&
    (options?.enabled === undefined ? true : options.enabled);

  const mergedParams = (params ?? null) as Record<string, unknown> | null;

  return useQuery({
    queryKey: queryKeys.resellers.fromMainAppByTenant(
      tid || null,
      mergedParams,
    ),
    queryFn: () => resellerService.fromMainAppByTenantId(tid, params),
    enabled,
    staleTime: 60_000,
  });
}
