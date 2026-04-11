/**
 * Billing backend API URLs:
 * - Prefer `NEXT_PUBLIC_BILLING_BACKEND_URL` (origin only, no path), e.g. `https://your-host`
 *   → server-side API base = `{origin}/api/backend` (Sanctum-protected routes).
 * - Legacy: `NEXT_PUBLIC_LARAVEL_API_URL` (same shape) if the new name is not set.
 * - Legacy: `NEXT_PUBLIC_API_BASE_URL` = `https://host/api` → same as `{origin}/api/backend` after normalization.
 *
 * **Browser and Node (SSR / services):** The billing backend is reached only via this app’s Route Handlers
 * (`/api/billing-backend`, `/api/billing-api`, `/sanctum/csrf-cookie`). Server-side Axios uses
 * `getInternalNextOrigin()` + those paths so TLS to the backend stays in `proxyRequestToUrl` (`API_TLS_INSECURE`).
 * Set `INTERNAL_NEXT_ORIGIN` in Docker/K8s (e.g. `http://frontend:3000`) when the server must not use localhost.
 *
 * Token bootstrap (`/api/get-token`, refresh, …) lives under `/api` by default; override with `API_TOKEN_BOOTSTRAP_BASE_URL`.
 *
 * TLS: `ERR_CERT_COMMON_NAME_INVALID` in the browser means the certificate does not match the hostname/IP
 * you typed (not fixable in JS). Use `http://` on a trusted LAN, use the cert’s hostname, or reissue TLS with
 * correct SAN. Self-signed HTTPS to the billing backend from **this** Node process: set `API_TLS_INSECURE` to
 * `1`, `true`, `yes`, or `on` (see `instrumentation.ts` + `getBillingBackendHttpsAgent()`).
 */

/** Next.js proxy → upstream `/api/backend/*`. */
export const BILLING_BACKEND_PROXY_BASE = "/api/billing-backend";

/** Next.js proxy → upstream `/api/*` (outside `/api/backend`). */
export const BILLING_API_PROXY_BASE = "/api/billing-api";

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

/** Sanctum + app routes: `/api/backend` on the billing backend host. */
export function getPublicApiBaseUrl(): string {
  const direct =
    process.env.NEXT_PUBLIC_BILLING_BACKEND_URL?.trim().replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_LARAVEL_API_URL?.trim().replace(/\/$/, "");
  if (direct) {
    return `${direct}/api/backend`;
  }
  const legacy = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");
  if (!legacy) {
    throw new Error(
      "Set NEXT_PUBLIC_BILLING_BACKEND_URL (or NEXT_PUBLIC_LARAVEL_API_URL / NEXT_PUBLIC_API_BASE_URL)",
    );
  }
  if (legacy.endsWith("/api/backend")) return legacy;
  if (legacy.endsWith("/api")) return `${legacy}/backend`;
  return `${legacy}/api/backend`;
}

/**
 * This Next deployment’s origin, for server-side HTTP clients that call local Route Handlers
 * (loopback to `/api/billing-backend`, `/api/billing-api`, …). Not exposed to the browser.
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

/** Billing backend `/api/backend` URL — for Route Handlers that proxy upstream (not for Axios baseURL on the server). */
export function getServerApiBaseUrl(): string {
  const server = process.env.API_BASE_URL?.trim().replace(/\/$/, "");
  if (server) {
    if (server.endsWith("/api/backend")) return server;
    if (server.endsWith("/api")) return `${server}/backend`;
    return `${server}/api/backend`;
  }
  return getPublicApiBaseUrl();
}

/**
 * Base for legacy token routes (`/get-token`, `/refresh-token`, …) — usually `/api`, not `/api/backend`.
 * Override if your billing backend app moved these (e.g. same as `getServerApiBaseUrl()`).
 */
export function getTokenBootstrapBaseUrl(): string {
  const explicit = process.env.API_TOKEN_BOOTSTRAP_BASE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const server = process.env.API_BASE_URL?.trim().replace(/\/$/, "");
  if (server) {
    if (server.endsWith("/api/backend")) return server.replace(/\/backend$/, "");
    if (server.endsWith("/api")) return server;
  }
  return `${resolveBillingBackendOriginInner()}/api`;
}

/**
 * Public / payment / webhook routes are often registered under `/api/...` (not `/api/backend/...`).
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
  const server = process.env.API_BASE_URL?.trim().replace(/\/$/, "");
  if (server) {
    if (server.endsWith("/api/backend")) {
      return server.replace(/\/api\/backend$/, "/api");
    }
    if (server.endsWith("/api")) return server;
  }
  return getBillingBackendPublicApiBaseUrl();
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
 * Axios `baseURL`: always the Next proxy (`BILLING_BACKEND_PROXY_BASE` in the browser, absolute URL on the server).
 */
export function getAxiosBaseUrl(): string {
  if (typeof window === "undefined") {
    return `${getInternalNextOrigin()}${BILLING_BACKEND_PROXY_BASE}`;
  }
  return BILLING_BACKEND_PROXY_BASE;
}

/** `/api/...` paths outside `/api/backend` (get-token, public routes) — proxied via `BILLING_API_PROXY_BASE`. */
export function resolveLegacyBillingApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return `${BILLING_API_PROXY_BASE}${p}`;
  }
  return `${getInternalNextOrigin()}${BILLING_API_PROXY_BASE}${p}`;
}

export function resolvePublicBillingApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return `${BILLING_API_PROXY_BASE}${p}`;
  }
  return `${getInternalNextOrigin()}${BILLING_API_PROXY_BASE}${p}`;
}
