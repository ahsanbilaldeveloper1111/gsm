"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import { fetchAnalyticsDashboardCharts } from "@/services/analytics.service";

export function useAnalyticsDashboardCharts() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.analytics.dashboardCharts(),
    queryFn: fetchAnalyticsDashboardCharts,
    enabled,
  });
}
