/**
 * Token endpoints without JWT (`/get-token`, `/refresh-token`, …).
 * Prefer `bootstrapTokenFromServer` + `POST /api/auth/laravel-token` for secrets.
 */
import { apiGet, apiPost, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

const t = apiRoutes.token;

export const tokenPublicService = {
  getTokenGet: (params?: QueryParams) =>
    apiGet<unknown>(t.getToken(), params),

  getTokenPost: (body: unknown) =>
    apiPost<unknown>(t.getTokenPost(), body),

  refreshTokenPost: (body?: unknown) =>
    apiPost<unknown>(t.refreshToken(), body),

  getRefreshToken: (body?: unknown) =>
    apiPost<unknown>(t.getRefreshToken(), body),
};
