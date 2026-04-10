"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/query-keys";
import { fetchDashboardWithParams } from "@/services/dashboard.service";

export function useDashboardParams(params: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.dashboard.indexWithParams(
      params as Record<string, unknown>,
    ),
    queryFn: () => fetchDashboardWithParams(params),
    enabled,
  });
}
