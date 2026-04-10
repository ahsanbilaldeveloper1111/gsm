import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiGet, apiGetBlob, apiPost, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

const r = apiRoutes.payments;

export const paymentService = {
  list: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.index(), params),

  create: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.store(), body),

  refund: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.refund(), body),

  evidence: (
    paymentId: number | string,
    fileIndex: number | string,
    params?: QueryParams,
  ) => apiGetBlob(r.evidence(paymentId, fileIndex), params),

  show: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.show(id), params),

  status: (paymentIntentId: string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.status(paymentIntentId), params),

  repay: (id: number | string, body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.repay(id), body),

  cancel: (id: number | string, body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.cancel(id), body),
};
