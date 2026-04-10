import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiGet, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/api-routes";
import type { AuditLog, IndexAuditLogParams } from "@/models/audit-log";

export async function fetchAuditLogs(
  params?: IndexAuditLogParams,
): Promise<ApiSuccessResponse<AuditLog[]>> {
  return apiGet<ApiSuccessResponse<AuditLog[]>>(
    apiRoutes.auditLogs(),
    params as QueryParams | undefined,
  );
}
