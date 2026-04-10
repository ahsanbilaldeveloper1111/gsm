"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchAnalyticsDashboardOverview } from "@/services/analytics.service";
import { useAuth } from "@/contexts/auth-context";

export function useAnalyticsDashboardOverview() {
  const { token, isBootstrapping } = useAuth();
  return useQuery({
    queryKey: queryKeys.analytics.dashboardOverview(),
    queryFn: fetchAnalyticsDashboardOverview,
    enabled: !isBootstrapping && !!token,
  });
}
