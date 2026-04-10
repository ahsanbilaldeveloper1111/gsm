"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import { fetchDashboard } from "@/services/dashboard.service";

export function useDashboard() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.dashboard.index(),
    queryFn: fetchDashboard,
    enabled,
  });
}
