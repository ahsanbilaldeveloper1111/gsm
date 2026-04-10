"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import type { IndexAuditLogParams } from "@/models/audit-log";
import { fetchAuditLogs } from "@/services/audit-logs.service";

export function useAuditLogs(params?: IndexAuditLogParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.auditLogs.list(
      (params as Record<string, unknown> | undefined) ?? null,
    ),
    queryFn: () => fetchAuditLogs(params),
    enabled,
  });
}
