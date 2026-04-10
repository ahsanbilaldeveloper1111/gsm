import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiDelete, apiGet, apiPost, apiPut, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

const r = apiRoutes.products;

export const productService = {
  list: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.index(), params),

  active: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.active(), params),

  withCompanyPricing: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.withCompanyPricing(), params),

  withCustomerPricing: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.withCustomerPricing(), params),

  create: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.store(), body),

  categoriesList: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.categoriesList(), params),

  createCategory: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.categories(), body),

  updateCategory: (id: number | string, body: unknown) =>
    apiPut<ApiSuccessResponse<unknown>>(r.updateCategory(id), body),

  deleteCategory: (id: number | string) =>
    apiDelete<ApiSuccessResponse<unknown>>(r.deleteCategory(id)),

  show: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.show(id), params),

  update: (id: number | string, body: unknown) =>
    apiPut<ApiSuccessResponse<unknown>>(r.update(id), body),

  post: (id: number | string, body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.post(id), body),

  destroy: (id: number | string) =>
    apiDelete<ApiSuccessResponse<unknown>>(r.destroy(id)),

  softDelete: (id: number | string, body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.softDelete(id), body),

  restore: (id: number | string, body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.restore(id), body),

  pricing: (
    productId: number | string,
    tenantId: number | string,
    params?: QueryParams,
  ) =>
    apiGet<ApiSuccessResponse<unknown>>(r.pricing(productId, tenantId), params),
};
