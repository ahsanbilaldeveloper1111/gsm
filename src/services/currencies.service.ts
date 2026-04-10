import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiDelete, apiGet, apiPost, apiPut, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

const r = apiRoutes.currencies;

export const currencyService = {
  list: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.index(), params),

  active: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.active(), params),

  base: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.base(), params),

  byCode: (code: string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.code(code), params),

  updateRates: (body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.updateRates(), body),

  convert: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.convert(), body),

  stats: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.stats(), params),

  recentlyUpdated: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.recentlyUpdated(), params),

  supported: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.supported(), params),

  add: (body: unknown) => apiPost<ApiSuccessResponse<unknown>>(r.add(), body),

  update: (id: number | string, body: unknown) =>
    apiPut<ApiSuccessResponse<unknown>>(r.update(id), body),

  destroy: (id: number | string) =>
    apiDelete<ApiSuccessResponse<unknown>>(r.destroy(id)),

  checkSupport: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.checkSupport(), body),
};
