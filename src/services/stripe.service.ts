import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiDelete, apiGet, apiPost, apiPut, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

const r = apiRoutes.stripe;

export const stripeService = {
  paymentMethodsForCustomer: (
    crmCompanyId: string,
    params?: QueryParams,
  ) =>
    apiGet<ApiSuccessResponse<unknown>>(
      r.paymentMethodsForCustomer(crmCompanyId),
      params,
    ),

  createPaymentMethodForCustomer: (crmCompanyId: string, body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(
      r.createPaymentMethodForCustomer(crmCompanyId),
      body,
    ),

  createPaymentMethodWithElementsForCustomer: (
    crmCompanyId: string,
    body: unknown,
  ) =>
    apiPost<ApiSuccessResponse<unknown>>(
      r.createPaymentMethodWithElementsForCustomer(crmCompanyId),
      body,
    ),

  createAndConfirmPaymentMethodForCustomer: (
    crmCompanyId: string,
    body: unknown,
  ) =>
    apiPost<ApiSuccessResponse<unknown>>(
      r.createAndConfirmPaymentMethodForCustomer(crmCompanyId),
      body,
    ),

  setDefaultForCustomer: (crmCompanyId: string, body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(
      r.setDefaultForCustomer(crmCompanyId),
      body,
    ),

  paymentMethods: (profileId: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(
      r.paymentMethods(profileId),
      params,
    ),

  createPaymentMethod: (profileId: number | string, body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(
      r.createPaymentMethod(profileId),
      body,
    ),

  updatePaymentMethod: (paymentMethodId: string, body: unknown) =>
    apiPut<ApiSuccessResponse<unknown>>(
      r.updatePaymentMethod(paymentMethodId),
      body,
    ),

  deletePaymentMethod: (paymentMethodId: string) =>
    apiDelete<ApiSuccessResponse<unknown>>(
      r.deletePaymentMethod(paymentMethodId),
    ),

  setDefault: (profileId: number | string, body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.setDefault(profileId), body),

  validateCard: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.validateCard(), body),

  testCardValidation: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.testCardValidation(), params),

  savePaymentMethod: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.savePaymentMethod(), body),

  createPaymentIntent: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.createPaymentIntent(), body),

  createPaymentMethodAndIntent: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.createPaymentMethodAndIntent(), body),

  confirmPaymentIntent: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.confirmPaymentIntent(), body),

  incompletePayments: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.incompletePayments(), params),

  completePayment: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.completePayment(), body),

  retryPayment: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.retryPayment(), body),

  publishableKey: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.publishableKey(), params),

  latestTransactionFee: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.latestTransactionFee(), params),

  createPaymentMethodByProfile: (profileId: number | string, body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(
      r.createPaymentMethodByProfile(profileId),
      body,
    ),

  createAndConfirmPaymentMethodByProfile: (
    profileId: number | string,
    body: unknown,
  ) =>
    apiPost<ApiSuccessResponse<unknown>>(
      r.createAndConfirmPaymentMethodByProfile(profileId),
      body,
    ),
};
