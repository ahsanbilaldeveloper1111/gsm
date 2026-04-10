import type { ApiSuccessResponse } from "@/lib/api/types";
import type { ExpenseCategory } from "@/models/Expense";
import { apiDelete, apiGet, apiPost, apiPut, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

const r = apiRoutes.expenseCategories;

export const expenseCategoryService = {
  list: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<ExpenseCategory[]>>(r.index(), params),

  create: (body: unknown) =>
    apiPost<ApiSuccessResponse<ExpenseCategory>>(r.store(), body),

  show: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<ExpenseCategory>>(r.show(id), params),

  update: (id: number | string, body: unknown) =>
    apiPut<ApiSuccessResponse<ExpenseCategory>>(r.update(id), body),

  destroy: (id: number | string) =>
    apiDelete<ApiSuccessResponse<unknown>>(r.destroy(id)),

  softDelete: (id: number | string, body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.softDelete(id), body),

  restore: (id: number | string, body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.restore(id), body),
};
