import type { ApiSuccessResponse } from "@/lib/api/types";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPostForm,
  type QueryParams,
} from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type { IndexVendorParams, Vendor } from "@/models/Vendor";

const r = apiRoutes.vendors;

export const vendorService = {
  list: (params?: IndexVendorParams) =>
    apiGet<ApiSuccessResponse<Vendor[]>>(
      r.index(),
      params as QueryParams | undefined,
    ),

  create: (body: unknown) =>
    body instanceof FormData
      ? apiPostForm<ApiSuccessResponse<Vendor>>(r.store(), body)
      : apiPost<ApiSuccessResponse<Vendor>>(r.store(), body),

  show: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Vendor>>(r.show(id), params),

  update: (id: number | string, body: unknown) =>
    body instanceof FormData
      ? apiPostForm<ApiSuccessResponse<unknown>>(r.update(id), body)
      : apiPost<ApiSuccessResponse<unknown>>(r.update(id), body),

  destroy: (id: number | string) =>
    apiDelete<ApiSuccessResponse<unknown>>(r.destroy(id)),
};
