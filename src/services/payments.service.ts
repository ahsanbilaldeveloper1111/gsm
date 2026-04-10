import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiGet, apiGetBlob, apiPost, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type {
  CreatePaymentData,
  CreateRefundData,
  IndexPaymentParams,
  Payment,
} from "@/models/Payment";

const r = apiRoutes.payments;

export const paymentService = {
  list: (params?: IndexPaymentParams) =>
    apiGet<ApiSuccessResponse<Payment[]>>(
      r.index(),
      params as QueryParams | undefined,
    ),

  create: (body: CreatePaymentData) =>
    apiPost<ApiSuccessResponse<Payment>>(r.store(), body),

  refund: (body: CreateRefundData) =>
    apiPost<ApiSuccessResponse<unknown>>(r.refund(), body),

  evidence: (
    paymentId: number | string,
    fileIndex: number | string,
    params?: QueryParams,
  ) => apiGetBlob(r.evidence(paymentId, fileIndex), params),

  show: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Payment>>(r.show(id), params),

  status: (paymentIntentId: string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.status(paymentIntentId), params),

  repay: (id: number | string, body?: unknown) =>
    apiPost<ApiSuccessResponse<Payment>>(r.repay(id), body),

  cancel: (id: number | string, body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.cancel(id), body),
};
