"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import { fetchAnalyticsDashboardCounters } from "@/services/analytics.service";

export function useAnalyticsDashboardCounters() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.analytics.dashboardCounters(),
    queryFn: fetchAnalyticsDashboardCounters,
    enabled,
  });
}
