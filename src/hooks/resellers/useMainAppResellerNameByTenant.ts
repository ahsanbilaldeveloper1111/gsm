"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/queryKeys";
import { resellerService } from "@/services/resellers.service";

/**
 * Display name for a main-app reseller resolved by billing tenant id
 * (`GET /resellers/name-by-tenant/{tenantId}`).
 */
export function useMainAppResellerNameByTenant(
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
    queryKey: queryKeys.resellers.nameByTenant(tid || null, mergedParams),
    queryFn: () => resellerService.nameByTenantId(tid, params),
    enabled,
    staleTime: 60_000,
  });
}
