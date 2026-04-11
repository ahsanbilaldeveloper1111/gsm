import { AxiosError } from "axios";
import { apiClient } from "@/lib/api/axiosClient";
import type { ApiSuccessResponse } from "@/lib/api/types";
import { postJsonWithXhr } from "@/lib/auth/postJsonWithXhr";
import { getXsrfHeadersForFetch } from "@/lib/auth/xsrfBrowser";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import {
  clearStoredToken,
  parseExpiresInSeconds,
  setStoredToken,
} from "@/lib/auth/tokenStore";
import {
  BILLING_BACKEND_PROXY_BASE,
  getInternalNextOrigin,
} from "@/lib/env";
import { User } from "@/models/User";
import { fetchSanctumCsrfCookie } from "@/services/sanctum.service";

export type LoginPayload = {
  samaccountname: string;
  password: string;
};

/** Flat shape (legacy) or `data` payload from Sanctum login envelope. */
export type LoginResult = {
  access_token?: string;
  token?: string;
  expires_in?: number | string;
  user?: unknown;
  message?: string;
  requires_google_auth_verification?: boolean;
  success?: boolean;
};

type LoginDataPayload = {
  access_token?: string;
  token?: string;
  user?: unknown;
  expires_in?: number;
  requires_google_auth_verification?: boolean;
};

function normalizeBearerValue(jwt: string): string {
  const t = jwt.trim();
  return t.replace(/^Bearer\s+/i, "").trim();
}

/**
 * Reads `access_token` / `token` from Sanctum envelope or flat JSON.
 * Tolerant of `success: 1` / `"true"` so we never skip persisting the JWT.
 */
function extractExpiresInFromLoginJson(raw: unknown): number | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && !Array.isArray(r.data)) {
    const d = r.data as Record<string, unknown>;
    if ("expires_in" in d) return parseExpiresInSeconds(d.expires_in);
  }
  if ("expires_in" in r) return parseExpiresInSeconds(r.expires_in);
  return null;
}

function extractAccessTokenFromLoginJson(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && !Array.isArray(r.data)) {
    const d = r.data as Record<string, unknown>;
    const jwt = d.access_token ?? d.token;
    if (typeof jwt === "string" && jwt.length > 0) {
      return normalizeBearerValue(jwt);
    }
  }
  const flat = r.access_token ?? r.token;
  if (typeof flat === "string" && flat.length > 0) {
    return normalizeBearerValue(flat);
  }
  return null;
}

function isApiSuccessTruthy(success: unknown): boolean {
  return (
    success === true ||
    success === 1 ||
    success === "true" ||
    success === "1"
  );
}

/** Winston only runs on the server; client login uses the proxy logs + console on hard failures. */
async function logLoginFlowServer(
  phase: string,
  detail: Record<string, unknown> = {},
): Promise<void> {
  if (typeof window !== "undefined") return;
  const { logLoginFlowError } = await import("@/lib/httpRequestFileLogger");
  logLoginFlowError({ phase, ...detail });
}

/**
 * POST /api/backend/login — billing backend `ApiResponse` envelope with `data.access_token` (Sanctum),
 * or legacy flat JSON.
 *
 * Browser: `XMLHttpRequest` + UTF-8 JSON string (not Axios/fetch) so interceptors cannot replace the body with
 * `{ is_super_user: 1 }`. Server: `fetch` loopback to the billing-backend proxy.
 */
export async function loginRequest(body: LoginPayload): Promise<LoginResult> {
  await fetchSanctumCsrfCookie();
  const samaccountname = String(body.samaccountname ?? "").trim();
  const password = String(body.password ?? "");
  if (!samaccountname || !password) {
    await logLoginFlowServer("validation_missing_credentials", {});
    throw new Error("Username and password are required.");
  }
  const path = apiRoutes.auth.login();
  const origin =
    typeof window !== "undefined" ? "" : getInternalNextOrigin();
  const url = `${origin}${BILLING_BACKEND_PROXY_BASE}${path}`;
  const payload = JSON.stringify({
    samaccountname,
    password,
    is_super_user: 1,
  });
  if (
    !payload.includes('"samaccountname"') ||
    !payload.includes('"password"')
  ) {
    await logLoginFlowServer("validation_serialization_fields", {
      payloadByteLength: payload.length,
    });
    throw new Error(
      "Login refused: credential fields missing after serialization.",
    );
  }

  const commonHeaders: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8",
    ...getXsrfHeadersForFetch(),
  };

  let status: number;
  let statusText: string;
  let text: string;

  if (typeof window !== "undefined") {
    let xhrResult: { status: number; statusText: string; text: string };
    try {
      xhrResult = await postJsonWithXhr(url, payload, commonHeaders);
    } catch (e) {
      console.error("[loginRequest] xhr_network", {
        message: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
    status = xhrResult.status;
    statusText = xhrResult.statusText;
    text = xhrResult.text;
  } else {
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: commonHeaders,
        body: payload,
      });
    } catch (e) {
      await logLoginFlowServer("fetch_loopback_network", {
        message: e instanceof Error ? e.message : String(e),
        name: e instanceof Error ? e.name : undefined,
      });
      throw e;
    }
    status = res.status;
    statusText = res.statusText;
    try {
      text = await res.text();
    } catch (e) {
      await logLoginFlowServer("fetch_loopback_read_body", {
        status,
        statusText,
        message: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  }

  let raw: unknown;
  try {
    raw = text ? JSON.parse(text) : null;
  } catch {
    await logLoginFlowServer("response_json_parse", {
      status,
      statusText,
      responseTextLength: text?.length ?? 0,
    });
    throw new AxiosError(
      "Login response was not JSON",
      "ERR_BAD_RESPONSE",
      undefined,
      undefined,
      {
        status,
        statusText,
        data: text,
        headers: {},
        config: {} as never,
      },
    );
  }

  if (status < 200 || status >= 300) {
    await logLoginFlowServer("http_non_success", {
      status,
      statusText,
      hasEnvelope:
        raw &&
        typeof raw === "object" &&
        "message" in (raw as object),
    });
    throw new AxiosError(
      `Request failed with status ${status}`,
      AxiosError.ERR_BAD_REQUEST,
      undefined,
      undefined,
      {
        status,
        statusText,
        data: raw,
        headers: {},
        config: {} as never,
      },
    );
  }

  const persisted = extractAccessTokenFromLoginJson(raw);
  const expiresIn = extractExpiresInFromLoginJson(raw);
  if (persisted) {
    setStoredToken(persisted, { expiresInSeconds: expiresIn ?? undefined });
  }

  if (
    raw &&
    typeof raw === "object" &&
    isApiSuccessTruthy((raw as Record<string, unknown>).success) &&
    "data" in raw &&
    (raw as Record<string, unknown>).data != null &&
    typeof (raw as Record<string, unknown>).data === "object" &&
    !Array.isArray((raw as Record<string, unknown>).data)
  ) {
    const envelope = raw as ApiSuccessResponse<LoginDataPayload>;
    const d = envelope.data;
    return {
      access_token: d.access_token,
      token: d.token,
      expires_in: d.expires_in,
      user: d.user,
      message: envelope.message,
      requires_google_auth_verification: d.requires_google_auth_verification,
      success: true,
    };
  }

  return raw as LoginResult;
}

const logoutPostConfig = {
  headers: { "Content-Type": "application/json" },
  beforeRedirect: (opts: { method?: string }) => {
    opts.method = "POST";
  },
};

/** POST `…/api/backend/logout` (Axios base `/api/billing-backend` + `/logout`). */
export async function logoutRequest(): Promise<void> {
  try {
    // Same as login: billing backend `VerifyCsrfToken` expects a fresh `XSRF-TOKEN` + `X-XSRF-TOKEN` pair.
    await fetchSanctumCsrfCookie();
    await apiClient.post(apiRoutes.auth.logout(), {}, logoutPostConfig);
  } catch (e) {
    if (typeof window !== "undefined") {
      console.error("[logoutRequest]", {
        message: e instanceof Error ? e.message : String(e),
      });
    }
    await logLoginFlowServer("logout_request", {
      message: e instanceof Error ? e.message : String(e),
      name: e instanceof Error ? e.name : undefined,
    });
    throw e;
  } finally {
    clearStoredToken();
  }
}

export type CurrentUserResponse = {
  user?: User;
  message?: string;
};

export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
  const path = apiRoutes.auth.user();
  const { data: raw } = await apiClient.get<
    ApiSuccessResponse<{ user?: User }> | CurrentUserResponse
  >(path);
  if (
    raw &&
    typeof raw === "object" &&
    "success" in raw &&
    raw.success === true &&
    "data" in raw
  ) {
    const envelope = raw as ApiSuccessResponse<{ user?: User }>;
    const inner = envelope.data;
    return {
      user: inner?.user,
      message: envelope.message,
    };
  }
  return raw as CurrentUserResponse;
}

export async function fetchCurrentUserApiWrapped(): Promise<
  ApiSuccessResponse<unknown>
> {
  const path = apiRoutes.auth.user();
  const { data } = await apiClient.get<ApiSuccessResponse<unknown>>(path);
  return data;
}

function maybeStoreTokenFromEnvelope(data: unknown): void {
  if (
    data &&
    typeof data === "object" &&
    "success" in data &&
    (data as { success?: boolean }).success === true &&
    "data" in data
  ) {
    const inner = (
      data as ApiSuccessResponse<{
        token?: string;
        access_token?: string;
        expires_in?: unknown;
      }>
    ).data;
    const jwt = inner?.access_token ?? inner?.token;
    if (jwt) {
      setStoredToken(jwt, { expiresInSeconds: inner?.expires_in });
    }
  }
}

export async function google2faVerify(body: unknown): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    apiRoutes.auth.google2fa.verify(),
    body,
  );
  maybeStoreTokenFromEnvelope(data);
  return data;
}

export async function google2faEnable(body: unknown): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    apiRoutes.auth.google2fa.enable(),
    body,
  );
  return data;
}

export async function google2faDisable(body: unknown): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    apiRoutes.auth.google2fa.disable(),
    body,
  );
  return data;
}

export async function google2faGenerateNewSecret(
  body?: unknown,
): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    apiRoutes.auth.google2fa.generateNewSecret(),
    body,
  );
  return data;
}
