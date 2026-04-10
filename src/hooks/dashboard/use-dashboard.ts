"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchDashboard } from "@/services/dashboard.service";
import { useAuth } from "@/contexts/auth-context";

export function useDashboard() {
  const { token, isBootstrapping } = useAuth();
  return useQuery({
    queryKey: queryKeys.dashboard.index(),
    queryFn: fetchDashboard,
    enabled: !isBootstrapping && !!token,
  });
}
