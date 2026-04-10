"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchAnalyticsDashboardCharts } from "@/services/analytics.service";
import { useAuth } from "@/contexts/auth-context";

export function useAnalyticsDashboardCharts() {
  const { token, isBootstrapping } = useAuth();
  return useQuery({
    queryKey: queryKeys.analytics.dashboardCharts(),
    queryFn: fetchAnalyticsDashboardCharts,
    enabled: !isBootstrapping && !!token,
  });
}
