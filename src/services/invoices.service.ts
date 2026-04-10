import type { ApiSuccessResponse } from "@/lib/api/types";
import {
  apiDelete,
  apiGet,
  apiGetBlob,
  apiPost,
  apiPut,
  type QueryParams,
} from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

const r = apiRoutes.invoices;

export const invoiceService = {
  list: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.index(), params),

  create: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.store(), body),

  show: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.show(id), params),

  details: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.details(id), params),

  pdf: (id: number | string, params?: QueryParams) =>
    apiGetBlob(r.pdf(id), params),

  createPdf: (id: number | string, params?: QueryParams) =>
    apiGetBlob(r.createPdf(id), params),

  send: (id: number | string, body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.send(id), body),

  generatePaymentLink: (id: number | string, body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.generatePaymentLink(id), body),

  stripeHostedCheckout: (id: number | string, body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.stripeHostedCheckout(id), body),

  stripePaymentLink: (id: number | string, body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.stripePaymentLink(id), body),

  update: (id: number | string, body: unknown) =>
    apiPut<ApiSuccessResponse<unknown>>(r.update(id), body),

  destroy: (id: number | string) =>
    apiDelete<ApiSuccessResponse<unknown>>(r.destroy(id)),
};

export const fetchInvoices = invoiceService.list;
