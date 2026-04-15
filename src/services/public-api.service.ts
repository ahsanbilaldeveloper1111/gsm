/**
 * Public billing backend routes (no JWT). Browser may still send a stored Bearer token;
 * the API should ignore it for these paths.
 *
 * Paths are relative to the same `/api` Next proxy as authenticated traffic.
 */
import { resolvePublicBillingApiUrl } from "@/lib/env";
import { apiGet, apiPost, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

const pub = apiRoutes.public;

function absPublicPath(relativePath: string): string {
  const p = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  return resolvePublicBillingApiUrl(p);
}

export const publicApiService = {
  invoicePayGet: (token: string, params?: QueryParams) =>
    apiGet<unknown>(absPublicPath(pub.invoicePay(token)), params),

  invoicePayPost: (token: string, body: unknown) =>
    apiPost<unknown>(absPublicPath(pub.invoicePay(token)), body),

  completePayment: (token: string, body?: unknown) =>
    apiPost<unknown>(absPublicPath(pub.completePayment(token)), body),

  /** Pass `session_id` (and any other query params) for Stripe return URLs. */
  verifyCheckoutSession: (params?: QueryParams) =>
    apiGet<unknown>(absPublicPath(pub.verifyCheckoutSession()), params),

  cancelCheckout: (body?: unknown) =>
    apiPost<unknown>(absPublicPath(pub.cancelCheckout()), body),
};
