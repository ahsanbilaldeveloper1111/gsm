import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiGet, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type { Company } from "@/models/Company";

const r = apiRoutes.crm;

export const crmService = {
  companies: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Company[]>>(r.companies(), params),

  company: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Company>>(r.company(id), params),
};
