/**
 * Token endpoints without JWT (`/get-token`, …) — same `/api` proxy as other Laravel routes.
 * SPA auth uses the login `access_token` + `expires_in` (see `tokenStore` + `axiosClient`).
 */
import { resolveLegacyBillingApiUrl } from "@/lib/env";
import { apiGet, apiPost, type QueryParams } from "@/lib/api/http";

function tokenPath(segment: string): string {
  const s = segment.startsWith("/") ? segment : `/${segment}`;
  return resolveLegacyBillingApiUrl(s);
}

export const tokenPublicService = {
  getTokenGet: (params?: QueryParams) =>
    apiGet<unknown>(tokenPath("/get-token"), params),

  getTokenPost: (body: unknown) =>
    apiPost<unknown>(tokenPath("/get-token"), body),

  refreshTokenPost: (body: unknown) =>
    apiPost<unknown>(tokenPath("/refresh-token"), body),

  getRefreshToken: (body: unknown) =>
    apiPost<unknown>(tokenPath("/get-refresh-token"), body),
};
