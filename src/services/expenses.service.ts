import type { ApiSuccessResponse } from "@/lib/api/types";
import type {
  CreateExpenseData,
  Expense,
  IndexExpenseParams,
  UpdateExpenseData,
} from "@/models/Expense";
import {
  apiDelete,
  apiGet,
  apiGetBlob,
  apiPost,
  type QueryParams,
} from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

const r = apiRoutes.expenses;

export const expenseService = {
  list: (params?: IndexExpenseParams) =>
    apiGet<ApiSuccessResponse<Expense[]>>(
      r.index(),
      params as QueryParams | undefined,
    ),

  create: (body: CreateExpenseData) =>
    apiPost<ApiSuccessResponse<Expense>>(r.store(), body),

  /** POST update (per API doc) */
  updatePost: (id: number | string, body: UpdateExpenseData) =>
    apiPost<ApiSuccessResponse<Expense>>(r.update(id), body),

  show: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Expense>>(r.show(id), params),

  pdf: (id: number | string, params?: QueryParams) =>
    apiGetBlob(r.pdf(id), params),

  createPdf: (id: number | string, params?: QueryParams) =>
    apiGetBlob(r.createPdf(id), params),

  destroy: (id: number | string) =>
    apiDelete<ApiSuccessResponse<unknown>>(r.destroy(id)),

  receipt: (id: number | string, params?: QueryParams) =>
    apiGetBlob(r.receipt(id), params),

  file: (id: number | string, fileIndex: number | string, params?: QueryParams) =>
    apiGetBlob(r.file(id, fileIndex), params),

  deleteFile: (id: number | string, fileIndex: number | string) =>
    apiDelete<ApiSuccessResponse<unknown>>(r.file(id, fileIndex)),
};
