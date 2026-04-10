"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import { fetchDashboard } from "@/services/dashboard.service";

export function useDashboard() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.dashboard.index(),
    queryFn: fetchDashboard,
    enabled,
  });
}
