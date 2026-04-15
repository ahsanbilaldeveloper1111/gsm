"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexAuditLogParams } from "@/models/AuditLog";
import {
  fetchAuditLogById,
  fetchAuditLogResourceTypes,
  fetchAuditLogs,
  fetchAuditLogsList,
} from "@/services/audit-logs.service";

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

export function useAuditLogsList(params?: IndexAuditLogParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.auditLogs.list(
      (params as Record<string, unknown> | undefined) ?? null,
    ),
    queryFn: () => fetchAuditLogsList(params),
    enabled,
  });
}

export function useAuditLogResourceTypes() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.auditLogs.resourceTypes(),
    queryFn: fetchAuditLogResourceTypes,
    enabled,
  });
}

export function useAuditLogById(id: number | string | null) {
  const enabled = useAuthQueryEnabled() && id != null;
  return useQuery({
    queryKey: queryKeys.auditLogs.detail(id),
    queryFn: () => fetchAuditLogById(id as number | string),
    enabled,
  });
}
