import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { getBillingBackendHttpsAgent } from "@/lib/api/nodeTlsAgent";
import {
  BILLING_BACKEND_PROXY_BASE,
  getAxiosBaseUrl,
  TELECOM_API_DATA_TYPE,
  useSameOriginApiProxy,
} from "@/lib/env";
import { apiRoutes } from "@/lib/routes/apiRoutes";

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
      if (useSameOriginApiProxy()) {
        const proxyBase = BILLING_BACKEND_PROXY_BASE;
        const raw = config.url;
        if (typeof raw === "string" && raw) {
          if (/^https?:\/\//i.test(raw)) {
            try {
              const loc = new URL(raw);
              const pathWithQuery = loc.pathname + loc.search;
              let relative: string | null = null;
              if (pathWithQuery.startsWith("/api/backend")) {
                relative = pathWithQuery.slice("/api/backend".length) || "/";
              } else if (pathWithQuery.startsWith("/api/billing-api")) {
                relative = pathWithQuery.slice("/api/billing-api".length) || "/";
              } else if (
                pathWithQuery === "/api" ||
                pathWithQuery.startsWith("/api/")
              ) {
                relative = pathWithQuery.slice("/api".length) || "/";
              }
              if (relative !== null) {
                config.baseURL = proxyBase;
                config.url = relative;
              }
            } catch {
              /* leave url/base */
            }
          } else if (raw === "/api" || raw.startsWith("/api/")) {
            config.baseURL = proxyBase;
            config.url = raw.slice("/api".length) || "/";
          } else {
            config.baseURL = proxyBase;
          }
        } else {
          config.baseURL = proxyBase;
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
      data_type: TELECOM_API_DATA_TYPE,
    };

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
  if (typeof window !== "undefined" && window.location.pathname === "/login") {
    return true;
  }
  return false;
}

function isUnauthorizedOrForbidden(status: number | undefined): boolean {
  return status === 401 || status === 403;
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _skipTokenRefresh?: boolean;
};

let refreshTokenPromise: Promise<boolean> | null = null;

async function fetchTokenSilently(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const client = getApiClient();
    const res = await client.post(
      apiRoutes.token.getTokenPost(),
      {},
      { validateStatus: (status) => status >= 200 && status < 300 },
    );
    return res.status >= 200 && res.status < 300;
  } catch {
    return false;
  }
}

async function refreshTokenWithLock(): Promise<boolean> {
  if (refreshTokenPromise) return refreshTokenPromise;
  refreshTokenPromise = fetchTokenSilently()
    .catch(() => false)
    .finally(() => {
      refreshTokenPromise = null;
    });
  return refreshTokenPromise;
}

function applyResponseInterceptor(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (!axios.isAxiosError(error) || !isUnauthorizedOrForbidden(error.response?.status)) {
        return Promise.reject(error);
      }
      if (typeof window === "undefined") return Promise.reject(error);
      const originalConfig = error.config as RetryableRequestConfig | undefined;
      if (!originalConfig) return Promise.reject(error);
      if (originalConfig._skipTokenRefresh) return Promise.reject(error);
      if (shouldSkipAuthRedirectToLogin(originalConfig)) return Promise.reject(error);
      if (originalConfig._retry) return Promise.reject(error);
      originalConfig._retry = true;
      return refreshTokenWithLock().then((ok) => {
        if (!ok) return Promise.reject(error);
        return client.request(originalConfig);
      });
    },
  );
}

let _client: AxiosInstance | null = null;

/**
 * Singleton Axios instance for the billing backend `/api`:
 * - `is_super_user=1` on the query for GETs; on POST/PUT/PATCH with a body, only in JSON/form (see interceptor)
 * - JWT is sent by proxy using HTTP-only cookie, not localStorage token headers
 * - `withCredentials: true`, `withXSRFToken: true`, cookie/header names — Sanctum CSRF (see `applyXsrfHeaderFromCookie`; call `fetchSanctumCsrfCookie` before login/logout)
 * - Server-side only: `API_TLS_INSECURE=1` uses `getBillingBackendHttpsAgent()` (same as proxy route handlers)
 * - Browser: on 401 or 403, call `POST /get-token` and retry once (no forced redirect).
 * - When `NEXT_PUBLIC_API_SAME_ORIGIN_PROXY` is off, `baseURL` is Laravel (`getPublicApiBaseUrl`); CORS must allow this origin.
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
