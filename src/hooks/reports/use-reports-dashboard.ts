"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import { reportService } from "@/services/reports.service";

export function useReportsDashboard() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.reports.dashboard(null),
    queryFn: () => reportService.dashboard(),
    enabled,
  });
}
