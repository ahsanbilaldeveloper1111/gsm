"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import { reportService } from "@/services/reports.service";

export function useReportsDashboard() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.reports.dashboard(null),
    queryFn: () => reportService.dashboard(),
    enabled,
  });
}
