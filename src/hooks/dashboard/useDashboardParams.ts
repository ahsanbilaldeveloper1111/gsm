"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/queryKeys";
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
