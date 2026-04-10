import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiDelete, apiGet, apiPost, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/api-routes";
import type {
  CreateCustomerData,
  Customer,
  IndexCustomerParams,
  UpdateCustomerData,
} from "@/models/customer";

const r = apiRoutes.customers;

export const customerService = {
  list: (params?: IndexCustomerParams) =>
    apiGet<ApiSuccessResponse<Customer[]>>(
      r.index(),
      params as QueryParams | undefined,
    ),

  create: (body: CreateCustomerData) =>
    apiPost<ApiSuccessResponse<Customer>>(r.store(), body),

  productPricingList: (customer: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(
      r.productPricingList(customer),
      params,
    ),

  createProductPricing: (customer: number | string, body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(
      r.productPricing(customer),
      body,
    ),

  bulkUpdateProductPricing: (customer: number | string, body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(
      r.bulkUpdateProductPricing(customer),
      body,
    ),

  copyProductPricingFromCompany: (
    customer: number | string,
    body?: unknown,
  ) =>
    apiPost<ApiSuccessResponse<unknown>>(
      r.copyFromCompany(customer),
      body,
    ),

  deleteProductPricing: (
    customer: number | string,
    productId: number | string,
  ) =>
    apiDelete<ApiSuccessResponse<unknown>>(
      r.deleteProductPricing(customer, productId),
    ),

  show: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Customer>>(r.show(id), params),

  update: (customer: number | string, body: UpdateCustomerData) =>
    apiPost<ApiSuccessResponse<Customer>>(r.update(customer), body),

  destroy: (customer: number | string) =>
    apiDelete<ApiSuccessResponse<unknown>>(r.destroy(customer)),
};
