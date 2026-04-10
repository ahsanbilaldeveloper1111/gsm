import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiGet, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

const r = apiRoutes.crm;

export const crmService = {
  companies: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.companies(), params),

  company: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.company(id), params),
};
