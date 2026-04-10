"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import { fetchAnalyticsDashboardOverview } from "@/services/analytics.service";

export function useAnalyticsDashboardOverview() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.analytics.dashboardOverview(),
    queryFn: fetchAnalyticsDashboardOverview,
    enabled,
  });
}
