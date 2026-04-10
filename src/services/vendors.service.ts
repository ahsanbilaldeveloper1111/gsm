import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiDelete, apiGet, apiPost, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/api-routes";
import type { Vendor } from "@/models/vendor";

const r = apiRoutes.vendors;

export const vendorService = {
  list: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Vendor[]>>(r.index(), params),

  create: (body: unknown) =>
    apiPost<ApiSuccessResponse<Vendor>>(r.store(), body),

  show: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Vendor>>(r.show(id), params),

  update: (id: number | string, body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.update(id), body),

  destroy: (id: number | string) =>
    apiDelete<ApiSuccessResponse<unknown>>(r.destroy(id)),
};
