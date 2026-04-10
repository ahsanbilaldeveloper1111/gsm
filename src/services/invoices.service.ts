import type { ApiSuccessResponse } from "@/lib/api/types";
import type {
  CreateInvoiceData,
  Invoice,
  IndexInvoiceParams,
  UpdateInvoiceData,
} from "@/models/invoice";
import {
  apiDelete,
  apiGet,
  apiGetBlob,
  apiPost,
  apiPut,
  type QueryParams,
} from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/api-routes";

const r = apiRoutes.invoices;

export const invoiceService = {
  list: (params?: IndexInvoiceParams) =>
    apiGet<ApiSuccessResponse<Invoice[]>>(
      r.index(),
      params as QueryParams | undefined,
    ),

  create: (body: CreateInvoiceData) =>
    apiPost<ApiSuccessResponse<Invoice>>(r.store(), body),

  show: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Invoice>>(r.show(id), params),

  details: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Invoice>>(r.details(id), params),

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

  update: (id: number | string, body: UpdateInvoiceData) =>
    apiPut<ApiSuccessResponse<Invoice>>(r.update(id), body),

  destroy: (id: number | string) =>
    apiDelete<ApiSuccessResponse<unknown>>(r.destroy(id)),
};

export const fetchInvoices = invoiceService.list;
