"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { QueryParams } from "@/lib/api/http";
import { analyticsService } from "@/services/analytics.service";

export function useAnalyticsDashboardCharts(params?: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.analytics.dashboardCharts(), params ?? null],
    queryFn: () => analyticsService.dashboardCharts(params),
    enabled,
  });
}
