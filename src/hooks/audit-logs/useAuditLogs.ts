"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexAuditLogParams } from "@/models/AuditLog";
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
