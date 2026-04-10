import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiGet, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

export async function fetchDashboard(): Promise<
  ApiSuccessResponse<unknown>
> {
  return apiGet<ApiSuccessResponse<unknown>>(apiRoutes.dashboard());
}

export async function fetchDashboardWithParams(
  params: QueryParams,
): Promise<ApiSuccessResponse<unknown>> {
  return apiGet<ApiSuccessResponse<unknown>>(apiRoutes.dashboard(), params);
}
