import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiPost } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

export async function sendEmail(
  body: unknown,
): Promise<ApiSuccessResponse<unknown>> {
  return apiPost<ApiSuccessResponse<unknown>>(apiRoutes.sendEmail(), body);
}
