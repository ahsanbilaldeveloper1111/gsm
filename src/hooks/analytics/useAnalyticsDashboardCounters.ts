"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import { fetchAnalyticsDashboardCounters } from "@/services/analytics.service";

export function useAnalyticsDashboardCounters() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.analytics.dashboardCounters(),
    queryFn: fetchAnalyticsDashboardCounters,
    enabled,
  });
}
