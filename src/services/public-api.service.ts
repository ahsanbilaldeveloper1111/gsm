/**
 * Public Laravel routes (no JWT). Browser may still send a stored Bearer token;
 * the API should ignore it for these paths.
 */
import { apiGet, apiPost, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/api-routes";

const pub = apiRoutes.public;

export const publicApiService = {
  invoicePayGet: (token: string, params?: QueryParams) =>
    apiGet<unknown>(pub.invoicePay(token), params),

  invoicePayPost: (token: string, body: unknown) =>
    apiPost<unknown>(pub.invoicePay(token), body),

  completePayment: (token: string, body?: unknown) =>
    apiPost<unknown>(pub.completePayment(token), body),

  /** Pass `session_id` (and any other query params) for Stripe return URLs. */
  verifyCheckoutSession: (params?: QueryParams) =>
    apiGet<unknown>(pub.verifyCheckoutSession(), params),

  cancelCheckout: (body?: unknown) =>
    apiPost<unknown>(pub.cancelCheckout(), body),
};
