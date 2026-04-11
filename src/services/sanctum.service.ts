import { apiClient } from "@/lib/api/axiosClient";
import { getSanctumCsrfCookieUrl } from "@/lib/env";

/**
 * Sanctum SPA step: `GET /sanctum/csrf-cookie` sets `XSRF-TOKEN` (and session cookie when applicable).
 * Call from the browser before cookie/session login. No-op on the server.
 */
export async function fetchSanctumCsrfCookie(): Promise<void> {
  if (typeof window === "undefined") return;
  const url = getSanctumCsrfCookieUrl();
  await apiClient.get(url);
}
