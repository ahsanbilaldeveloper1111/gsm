import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiGet, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type {
  AuditLog,
  AuditLogListEnvelope,
  IndexAuditLogParams,
} from "@/models/AuditLog";

export async function fetchAuditLogs(
  params?: IndexAuditLogParams,
): Promise<ApiSuccessResponse<AuditLog[]>> {
  return apiGet<ApiSuccessResponse<AuditLog[]>>(
    apiRoutes.auditLogs(),
    params as QueryParams | undefined,
  );
}

export async function fetchAuditLogsList(
  params?: IndexAuditLogParams,
): Promise<AuditLogListEnvelope> {
  return apiGet<AuditLogListEnvelope>(
    apiRoutes.auditLogs(),
    params as QueryParams | undefined,
  );
}

export async function fetchAuditLogResourceTypes(): Promise<{
  code?: number;
  message?: string;
  data?: string[];
}> {
  return apiGet<{ code?: number; message?: string; data?: string[] }>(
    `${apiRoutes.auditLogs()}/resource-types`,
  );
}

export async function fetchAuditLogById(id: number | string): Promise<{
  code?: number;
  message?: string;
  data?: AuditLog;
}> {
  return apiGet<{ code?: number; message?: string; data?: AuditLog }>(
    `${apiRoutes.auditLogs()}/${encodeURIComponent(String(id))}`,
  );
}
