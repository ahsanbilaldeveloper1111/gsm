import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiGet, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

export async function fetchAuditLogs(
  params?: QueryParams,
): Promise<ApiSuccessResponse<unknown>> {
  return apiGet<ApiSuccessResponse<unknown>>(apiRoutes.auditLogs(), params);
}
