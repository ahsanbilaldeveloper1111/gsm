import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { clearStoredToken, getStoredToken } from "@/lib/auth/tokenStore";
import { getBillingBackendHttpsAgent } from "@/lib/api/nodeTlsAgent";
import {
  BILLING_API_PROXY_BASE,
  BILLING_BACKEND_PROXY_BASE,
  getAxiosBaseUrl,
} from "@/lib/env";
import { appPaths } from "@/lib/navigation/appPaths";

const SUPER_Q = "is_super_user";
const SUPER_V = "1";

const XSRF_COOKIE = "XSRF-TOKEN";
const XSRF_HEADER = "X-XSRF-TOKEN";

/**
 * Billing backend `VerifyCsrfToken` needs `X-XSRF-TOKEN` to match the `XSRF-TOKEN` cookie. Axios normally adds
 * this in `resolveConfig`, but only when the request URL passes `isURLSameOrigin` — e.g. `localhost`
 * vs `127.0.0.1` breaks that check and the server returns **419**. Setting the header here guarantees
 * every same-tab API call sends CSRF when the cookie exists.
 */
function applyXsrfHeaderFromCookie(config: InternalAxiosRequestConfig): void {
  if (typeof document === "undefined") return;
  const match = document.cookie.match(
    new RegExp(
      `(?:^|; )${XSRF_COOKIE.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&")}=([^;]*)`,
    ),
  );
  const value = match ? decodeURIComponent(match[1]) : null;
  if (!value) return;
  config.headers.set(XSRF_HEADER, value);
}

/** Only spread plain JSON objects — `typeof x === "object"` is true for `Blob`, `null`, etc. */
function isPlainObjectForJsonMerge(
  v: unknown,
): v is Record<string, unknown> {
  if (v === null || typeof v !== "object") return false;
  if (Array.isArray(v)) return false;
  if (typeof FormData !== "undefined" && v instanceof FormData) return false;
  if (
    typeof URLSearchParams !== "undefined" &&
    v instanceof URLSearchParams
  ) {
    return false;
  }
  if (typeof Blob !== "undefined" && v instanceof Blob) return false;
  if (typeof ArrayBuffer !== "undefined" && v instanceof ArrayBuffer) {
    return false;
  }
  if (ArrayBuffer.isView(v)) return false;
  const proto = Object.getPrototypeOf(v as object);
  return proto === Object.prototype || proto === null;
}

function mergeJsonBody(config: InternalAxiosRequestConfig): void {
  const d = config.data;
  if (d == null) return;
  if (d instanceof FormData) {
    d.append(SUPER_Q, SUPER_V);
    return;
  }
  if (typeof URLSearchParams !== "undefined" && d instanceof URLSearchParams) {
    d.set(SUPER_Q, SUPER_V);
    return;
  }
  if (isPlainObjectForJsonMerge(d)) {
    config.data = { ...d, is_super_user: 1 };
    return;
  }
  if (typeof d === "string") {
    const trimmed = d.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return;
    try {
      const parsed: unknown = JSON.parse(d);
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        !(parsed instanceof Array)
      ) {
        config.data = JSON.stringify({
          ...(parsed as Record<string, unknown>),
          is_super_user: 1,
        });
      }
    } catch {
      /* leave string body */
    }
  }
}

function applyRequestInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      // Same-origin proxies: `BILLING_BACKEND_PROXY_BASE` vs `BILLING_API_PROXY_BASE` (legacy `/api/*`).
      // Axios merges baseURL + url — a path under `BILLING_API_PROXY_BASE` must NOT use `BILLING_BACKEND_PROXY_BASE`
      // or the request merges incorrectly (401 / wrong route).
      const raw = config.url;
      if (typeof raw === "string" && raw.startsWith(BILLING_API_PROXY_BASE)) {
        config.baseURL = BILLING_API_PROXY_BASE;
        config.url = raw.slice(BILLING_API_PROXY_BASE.length) || "/";
      } else {
        config.baseURL = BILLING_BACKEND_PROXY_BASE;
        if (raw && /^https?:\/\//i.test(raw)) {
          try {
            const u = new URL(raw);
            const pathWithQuery = u.pathname + u.search;
            if (pathWithQuery.startsWith("/api/backend")) {
              config.url =
                pathWithQuery.slice("/api/backend".length) || "/";
            } else if (
              u.pathname.startsWith("/api/") &&
              !u.pathname.startsWith("/api/billing-")
            ) {
              config.baseURL = BILLING_API_PROXY_BASE;
              config.url = u.pathname.slice("/api".length) + u.search || "/";
            }
          } catch {
            /* leave url */
          }
        }
      }
    } else {
      const agent = getBillingBackendHttpsAgent();
      if (agent) {
        config.httpsAgent = agent;
      }
    }

    const method = (config.method ?? "get").toLowerCase();
    const baseParams =
      typeof config.params === "object" && config.params !== null
        ? config.params
        : {};

    /**
     * Put `is_super_user` on the query string only when the request has no JSON/form body that
     * `mergeJsonBody` will enrich. Duplicating it on the URL for every POST breaks some reverse
     * proxies / PHP stacks (only query survives) — Laravel then sees just `is_super_user`, not
     * `samaccountname` / `password`.
     */
    let addSuperUserToQuery = true;
    if (["post", "put", "patch"].includes(method)) {
      const d = config.data;
      if (d != null) {
        if (
          isPlainObjectForJsonMerge(d) ||
          d instanceof FormData ||
          (typeof URLSearchParams !== "undefined" &&
            d instanceof URLSearchParams) ||
          (typeof d === "string" &&
            (d.trim().startsWith("{") || d.trim().startsWith("[")))
        ) {
          addSuperUserToQuery = false;
        }
      }
    }

    config.params = {
      ...baseParams,
      ...(addSuperUserToQuery ? { [SUPER_Q]: SUPER_V } : {}),
    };

    const token = getStoredToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    if (!config.headers.get("Accept") && !config.headers.get("accept")) {
      config.headers.set("Accept", "application/json");
    }

    if (["post", "put", "patch"].includes(method)) {
      const d = config.data;
      if (
        d &&
        typeof d === "object" &&
        !Array.isArray(d) &&
        !(d instanceof FormData) &&
        !(typeof URLSearchParams !== "undefined" && d instanceof URLSearchParams)
      ) {
        const ct = String(
          config.headers.get("Content-Type") ??
            config.headers.get("content-type") ??
            "",
        );
        if (!ct.includes("application/json")) {
          config.headers.set("Content-Type", "application/json");
        }
      }
      mergeJsonBody(config);
    }

    applyXsrfHeaderFromCookie(config);

    return config;
  });
}

/** Wrong-password login POST must not hard-redirect (stay on `/login`). */
function shouldSkipAuthRedirectToLogin(
  config: InternalAxiosRequestConfig | undefined,
): boolean {
  if (!config?.url) return false;
  const path = config.url.split("?")[0];
  if (path === "/login" || path.endsWith("/login")) return true;
  if (typeof window !== "undefined" && window.location.pathname === appPaths.login) {
    return true;
  }
  return false;
}

function isUnauthorizedOrForbidden(status: number | undefined): boolean {
  return status === 401 || status === 403;
}

let redirectingToLogin = false;

function applyResponseInterceptor(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (!axios.isAxiosError(error) || !isUnauthorizedOrForbidden(error.response?.status)) {
        return Promise.reject(error);
      }
      if (typeof window === "undefined") return Promise.reject(error);
      if (shouldSkipAuthRedirectToLogin(error.config)) return Promise.reject(error);
      if (redirectingToLogin) return Promise.reject(error);
      redirectingToLogin = true;
      clearStoredToken();
      window.location.replace(appPaths.login);
      return Promise.reject(error);
    },
  );
}

let _client: AxiosInstance | null = null;

/**
 * Singleton Axios instance for the billing backend `/api`:
 * - `is_super_user=1` on the query for GETs; on POST/PUT/PATCH with a body, only in JSON/form (see interceptor)
 * - `Authorization: Bearer <jwt>` when a token is stored
 * - `withCredentials: true`, `withXSRFToken: true`, cookie/header names — Sanctum CSRF (see `applyXsrfHeaderFromCookie`; call `fetchSanctumCsrfCookie` before login/logout)
 * - Server-side only: `API_TLS_INSECURE=1` uses `getBillingBackendHttpsAgent()` (same as proxy route handlers)
 * - Browser: **401** or **403** → clear token + `location.replace('/login')`, except failed **login** POST (`/login`).
 */
export function getApiClient(): AxiosInstance {
  if (!_client) {
    _client = axios.create({
      baseURL: getAxiosBaseUrl(),
      withCredentials: true,
      withXSRFToken: true,
      xsrfCookieName: XSRF_COOKIE,
      xsrfHeaderName: XSRF_HEADER,
      headers: { Accept: "application/json" },
      validateStatus: (status) => status >= 200 && status < 300,
      httpsAgent: getBillingBackendHttpsAgent(),
    });
    applyRequestInterceptors(_client);
    applyResponseInterceptor(_client);
  }
  return _client;
}

/** Singleton — use in services (`apiClient.get`, `apiClient.post`, …). */
export const apiClient = getApiClient();
