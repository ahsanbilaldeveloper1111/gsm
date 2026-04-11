import { AxiosError } from "axios";
import { apiClient } from "@/lib/api/axiosClient";
import type { ApiSuccessResponse } from "@/lib/api/types";
import { getXsrfHeadersForFetch } from "@/lib/auth/xsrfBrowser";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import { clearStoredToken, setStoredToken } from "@/lib/auth/tokenStore";
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

function applyLoginToken(data: LoginResult | LoginDataPayload): void {
  const jwt = data.access_token ?? data.token;
  if (jwt) setStoredToken(jwt);
}

/**
 * POST /api/backend/login — billing backend `ApiResponse` envelope with `data.access_token` (Sanctum),
 * or legacy flat JSON.
 *
 * Uses `fetch` + explicit `JSON.stringify` so credentials always arrive as the request body (some Axios /
 * proxy stacks dropped plain-object bodies and only forwarded `is_super_user`).
 */
export async function loginRequest(body: LoginPayload): Promise<LoginResult> {
  await fetchSanctumCsrfCookie();
  const samaccountname = body.samaccountname.trim();
  const password = body.password;
  if (!samaccountname || !password) {
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

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf-8",
      ...getXsrfHeadersForFetch(),
    },
    body: payload,
  });

  const text = await res.text();
  let raw: unknown;
  try {
    raw = text ? JSON.parse(text) : null;
  } catch {
    throw new AxiosError(
      "Login response was not JSON",
      "ERR_BAD_RESPONSE",
      undefined,
      undefined,
      {
        status: res.status,
        statusText: res.statusText,
        data: text,
        headers: {},
        config: {} as never,
      },
    );
  }

  if (!res.ok) {
    throw new AxiosError(
      `Request failed with status ${res.status}`,
      AxiosError.ERR_BAD_REQUEST,
      undefined,
      undefined,
      {
        status: res.status,
        statusText: res.statusText,
        data: raw,
        headers: {},
        config: {} as never,
      },
    );
  }

  if (
    raw &&
    typeof raw === "object" &&
    "success" in raw &&
    raw.success === true &&
    "data" in raw
  ) {
    const envelope = raw as ApiSuccessResponse<LoginDataPayload>;
    const d = envelope.data;
    applyLoginToken(d);
    return {
      access_token: d.access_token,
      token: d.token,
      user: d.user,
      message: envelope.message,
      requires_google_auth_verification: d.requires_google_auth_verification,
      success: true,
    };
  }

  const flat = raw as LoginResult;
  applyLoginToken(flat);
  return flat;
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
    const inner = (data as ApiSuccessResponse<{ token?: string; access_token?: string }>)
      .data;
    const jwt = inner?.access_token ?? inner?.token;
    if (jwt) setStoredToken(jwt);
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
