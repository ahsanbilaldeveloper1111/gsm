import type { ApiSuccessResponse } from "@/lib/api/types";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  type QueryParams,
} from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type {
  CreateCurrencyData,
  Currency,
  CurrencyStats,
  IndexCurrencyParams,
  UpdateCurrencyData,
} from "@/models/Currency";

const r = apiRoutes.currencies;

export const currencyService = {
  list: (params?: IndexCurrencyParams) =>
    apiGet<ApiSuccessResponse<Currency[]>>(
      r.index(),
      params as QueryParams | undefined,
    ),

  active: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Currency[]>>(r.active(), params),

  base: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Currency>>(r.base(), params),

  byCode: (code: string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Currency>>(r.code(code), params),

  updateRates: (body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.updateRates(), body),

  convert: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.convert(), body),

  stats: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<CurrencyStats>>(r.stats(), params),

  recentlyUpdated: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.recentlyUpdated(), params),

  supported: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.supported(), params),

  add: (body: CreateCurrencyData) =>
    apiPost<ApiSuccessResponse<Currency>>(r.add(), body),

  update: (id: number | string, body: UpdateCurrencyData) =>
    apiPut<ApiSuccessResponse<Currency>>(r.update(id), body),

  destroy: (id: number | string) =>
    apiDelete<ApiSuccessResponse<unknown>>(r.destroy(id)),

  checkSupport: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.checkSupport(), body),
};
