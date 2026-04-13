import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiGet, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

const r = apiRoutes.resellers;

export const resellerService = {
  /** GET `/resellers/from-main-app` — list reseller rows from main app. */
  listFromMainApp: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.fromMainApp(), params),
  /** GET `/resellers/from-main-app/by-tenant/{tenantId}` */
  fromMainAppByTenantId: (tenantId: string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(
      r.fromMainAppByTenantId(tenantId),
      params,
    ),
  /** GET `/resellers/name-by-tenant/{tenantId}` */
  nameByTenantId: (tenantId: string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.nameByTenantId(tenantId), params),
};
