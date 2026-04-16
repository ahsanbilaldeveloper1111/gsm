/**
 * Billing backend API URLs:
 * - Prefer `NEXT_PUBLIC_BILLING_BACKEND_URL` (origin only, no path), e.g. `https://your-host`
 *   → upstream JSON base = `{origin}/api`.
 * - Legacy: `NEXT_PUBLIC_LARAVEL_API_URL` (same shape) if the new name is not set.
 * - Legacy: `NEXT_PUBLIC_API_BASE_URL` = `https://host/api` (full API root) or origin-only.
 *
 * **Browser:** By default (`NEXT_PUBLIC_API_SAME_ORIGIN_PROXY=1`) all API calls go to **this Next app**
 * at `/api/...` (same origin as the UI). The Route Handler forwards to Laravel — no browser CORS to Laravel.
 * Set `NEXT_PUBLIC_API_SAME_ORIGIN_PROXY=0` only if the browser must call Laravel’s URL directly (then configure CORS on Laravel).
 *
 * **Server-side Axios:** With same-origin proxy, uses `getInternalNextOrigin()` + `/api` (loopback through Next).
 * With `NEXT_PUBLIC_API_SAME_ORIGIN_PROXY=0`, uses `getServerApiBaseUrl()` (direct to Laravel from Node).
 *
 * **Upstream for the proxy:** `API_BASE_URL` or `LARAVEL_UPSTREAM_ORIGIN` + `/api` (see `getServerApiBaseUrl`).
 * TLS from Node to Laravel: `API_TLS_INSECURE` + `proxyRequestToUrl`. Set `INTERNAL_NEXT_ORIGIN` in Docker/K8s when needed.
 *
 * Token bootstrap (`/api/get-token`, refresh, …) uses the same `/api` base unless overridden with `API_TOKEN_BOOTSTRAP_BASE_URL`.
 *
 * TLS: `ERR_CERT_COMMON_NAME_INVALID` in the browser means the certificate does not match the hostname/IP
 * you typed (not fixable in JS). Use `http://` on a trusted LAN, use the cert’s hostname, or reissue TLS with
 * correct SAN. Self-signed HTTPS to the billing backend from **this** Node process: set `API_TLS_INSECURE` to
 * `1`, `true`, `yes`, or `on` (see `instrumentation.ts` + `getBillingBackendHttpsAgent()`).
 */

/** Next.js same-origin prefix; proxies to Laravel `{origin}/api/*`. */
export const BILLING_BACKEND_PROXY_BASE = "/api";

/**
 * When true (default), the SPA calls **this Next app** at `/api` (same origin), not the Laravel host in the browser.
 * Set `NEXT_PUBLIC_API_SAME_ORIGIN_PROXY=0` to point Axios at Laravel directly (`getPublicApiBaseUrl()`).
 */
export function useSameOriginApiProxy(): boolean {
  const v = process.env.NEXT_PUBLIC_API_SAME_ORIGIN_PROXY?.trim().toLowerCase();
  if (v === undefined || v === "") return true;
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

/**
 * Legacy name — same as {@link BILLING_BACKEND_PROXY_BASE}. Previously `/api/billing-api` when Laravel split `/api` vs `/api/backend`.
 */
export const BILLING_API_PROXY_BASE = BILLING_BACKEND_PROXY_BASE;

/** Billing backend app origin (scheme + host + port), no `/api` path — used for Sanctum `/sanctum/csrf-cookie`. */
export function getBillingBackendAppOrigin(): string {
  return resolveBillingBackendOriginInner();
}

function resolveBillingBackendOriginInner(): string {
  const direct =
    process.env.NEXT_PUBLIC_BILLING_BACKEND_URL?.trim().replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_LARAVEL_API_URL?.trim().replace(/\/$/, "");
  if (direct) return direct;
  const legacy = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");
  if (!legacy) {
    throw new Error(
      "Set NEXT_PUBLIC_BILLING_BACKEND_URL (or NEXT_PUBLIC_LARAVEL_API_URL / NEXT_PUBLIC_API_BASE_URL)",
    );
  }
  if (legacy.endsWith("/api/backend")) {
    return legacy.slice(0, -"/api/backend".length);
  }
  if (legacy.endsWith("/api")) {
    return legacy.slice(0, -"/api".length);
  }
  return legacy;
}

/**
 * Billing backend origin for server Route Handlers (proxy to Sanctum, etc.).
 * Prefer `API_BASE_URL` when set so server-side matches internal network routes.
 */
export function getServerBillingBackendAppOrigin(): string {
  const server = process.env.API_BASE_URL?.trim().replace(/\/$/, "");
  if (server) {
    if (server.endsWith("/api/backend")) {
      return server.slice(0, -"/api/backend".length);
    }
    if (server.endsWith("/api")) return server.slice(0, -"/api".length);
  }
  return getBillingBackendAppOrigin();
}

/** Laravel API base URL on the billing backend host (`…/api`). */
export function getPublicApiBaseUrl(): string {
  const direct =
    process.env.NEXT_PUBLIC_BILLING_BACKEND_URL?.trim().replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_LARAVEL_API_URL?.trim().replace(/\/$/, "");
  if (direct) {
    return `${direct}/api`;
  }
  const legacy = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");
  if (!legacy) {
    throw new Error(
      "Set NEXT_PUBLIC_BILLING_BACKEND_URL (or NEXT_PUBLIC_LARAVEL_API_URL / NEXT_PUBLIC_API_BASE_URL)",
    );
  }
  if (legacy.endsWith("/api/backend")) {
    return legacy.replace(/\/api\/backend$/, "/api");
  }
  if (legacy.endsWith("/api")) return legacy;
  return `${legacy}/api`;
}

/**
 * This Next deployment’s origin, for server-side HTTP clients that call local Route Handlers
 * (loopback to `/api`, …). Not exposed to the browser.
 *
 * If `API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` is `http://…` but `NEXT_PUBLIC_APP_URL` is `https://…`,
 * do **not** use the public URL for loopback — server-side Axios would call `https://` while you intended HTTP.
 * Set `INTERNAL_NEXT_ORIGIN=http://127.0.0.1:3000` (or your LAN Next URL) to override.
 */
export function getInternalNextOrigin(): string {
  const explicit = process.env.INTERNAL_NEXT_ORIGIN?.trim().replace(/\/$/, "");
  if (explicit) return explicit;

  const apiBase = (
    process.env.API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    ""
  ).replace(/\/$/, "");
  const apiBaseIsHttp = apiBase.startsWith("http://");

  const pub = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (pub && !(apiBaseIsHttp && pub.startsWith("https://"))) {
    return pub;
  }

  if (process.env.VERCEL_URL && !apiBaseIsHttp) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  const port = process.env.PORT || "3000";
  return `http://127.0.0.1:${port}`;
}

/** Laravel `/api` URL — for Route Handlers that proxy upstream and for direct server-side Axios when same-origin proxy is off. */
export function getServerApiBaseUrl(): string {
  const server = process.env.API_BASE_URL?.trim().replace(/\/$/, "");
  if (server) {
    if (server.endsWith("/api/backend")) {
      return server.replace(/\/api\/backend$/, "/api");
    }
    if (server.endsWith("/api")) return server;
    return `${server}/api`;
  }
  const upstream = process.env.LARAVEL_UPSTREAM_ORIGIN?.trim().replace(/\/$/, "");
  if (upstream) {
    return `${upstream}/api`;
  }
  return getPublicApiBaseUrl();
}

/**
 * Base for token routes (`/get-token`, `/refresh-token`, …) on the Laravel host — usually same as `/api`.
 * Override with `API_TOKEN_BOOTSTRAP_BASE_URL` if these live elsewhere.
 */
export function getTokenBootstrapBaseUrl(): string {
  const explicit = process.env.API_TOKEN_BOOTSTRAP_BASE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  return getServerApiBaseUrl();
}

/**
 * Public / payment / webhook routes under Laravel `/api/...`.
 * Prefer `NEXT_PUBLIC_BILLING_PUBLIC_API_BASE_URL`; legacy `NEXT_PUBLIC_LARAVEL_PUBLIC_BASE_URL` is still read.
 */
export function getBillingBackendPublicApiBaseUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_BILLING_PUBLIC_API_BASE_URL?.trim().replace(
      /\/$/,
      "",
    ) ||
    process.env.NEXT_PUBLIC_LARAVEL_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  return `${resolveBillingBackendOriginInner()}/api`;
}

/**
 * `/api/...` on the billing backend host for server-side calls (matches `API_BASE_URL` when set).
 */
export function getServerBillingBackendPublicApiBaseUrl(): string {
  return getServerApiBaseUrl();
}

/**
 * `GET` target for Sanctum’s CSRF cookie (browser). Proxied by Next at `/sanctum/csrf-cookie`.
 */
export function getSanctumCsrfCookieUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/sanctum/csrf-cookie`;
  }
  return `${getInternalNextOrigin()}/sanctum/csrf-cookie`;
}

/**
 * Axios `baseURL`: same-origin `/api` on this Next app when {@link useSameOriginApiProxy} is true;
 * otherwise the Laravel API base (`getPublicApiBaseUrl` / `getServerApiBaseUrl`).
 */
export function getAxiosBaseUrl(): string {
  if (!useSameOriginApiProxy()) {
    if (typeof window === "undefined") {
      return getServerApiBaseUrl();
    }
    return getPublicApiBaseUrl();
  }
  if (typeof window === "undefined") {
    return `${getInternalNextOrigin()}${BILLING_BACKEND_PROXY_BASE}`;
  }
  return BILLING_BACKEND_PROXY_BASE;
}

/**
 * Base for login/logout `fetch` / XHR (not Axios). Matches {@link getAxiosBaseUrl} semantics so manual requests
 * stay on the Next `/api` proxy when same-origin is enabled.
 */
export function getAuthApiRequestBase(): string {
  if (typeof window === "undefined") {
    if (useSameOriginApiProxy()) {
      return `${getInternalNextOrigin()}${BILLING_BACKEND_PROXY_BASE}`;
    }
    return getServerApiBaseUrl();
  }
  if (useSameOriginApiProxy()) {
    return BILLING_BACKEND_PROXY_BASE;
  }
  return getPublicApiBaseUrl();
}

/** Path relative to Axios `baseURL` (`/api`) — same as prepending `/api` on the Next app. */
export function resolveLegacyBillingApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p;
}

/** @deprecated Use {@link resolveLegacyBillingApiUrl}; identical now that one proxy serves all `/api` routes. */
export function resolvePublicBillingApiUrl(path: string): string {
  return resolveLegacyBillingApiUrl(path);
}
