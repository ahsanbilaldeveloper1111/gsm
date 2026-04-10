"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchAnalyticsDashboardCounters } from "@/services/analytics.service";
import { useAuth } from "@/contexts/auth-context";

export function useAnalyticsDashboardCounters() {
  const { token, isBootstrapping } = useAuth();
  return useQuery({
    queryKey: queryKeys.analytics.dashboardCounters(),
    queryFn: fetchAnalyticsDashboardCounters,
    enabled: !isBootstrapping && !!token,
  });
}
