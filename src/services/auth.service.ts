import { apiClient } from "@/lib/api/axios-client";
import { apiRoutes } from "@/lib/routes/api-routes";
import type { ApiSuccessResponse } from "@/lib/api/types";
import { clearStoredToken, setStoredToken } from "@/lib/auth/token-store";

export type LoginPayload = {
  samaccountname: string;
  password: string;
};

export type LoginResult = {
  access_token?: string;
  token?: string;
  user?: unknown;
  message?: string;
  requires_google_auth_verification?: boolean;
  success?: boolean;
};

export async function loginRequest(body: LoginPayload): Promise<LoginResult> {
  const path = apiRoutes.auth.login();
  const { data } = await apiClient.post<LoginResult>(path, body, {
    headers: { "Content-Type": "application/json" },
  });
  const jwt = data.access_token ?? data.token;
  if (jwt) setStoredToken(jwt);
  return data;
}

export async function logoutRequest(): Promise<void> {
  const path = apiRoutes.auth.logout();
  try {
    await apiClient.post(path);
  } finally {
    clearStoredToken();
  }
}

export type CurrentUserResponse = {
  user?: unknown;
  message?: string;
};

export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
  const path = apiRoutes.auth.user();
  const { data } = await apiClient.get<CurrentUserResponse>(path);
  return data;
}

export async function fetchCurrentUserApiWrapped(): Promise<
  ApiSuccessResponse<unknown>
> {
  const path = apiRoutes.auth.user();
  const { data } = await apiClient.get<ApiSuccessResponse<unknown>>(path);
  return data;
}

export async function google2faVerify(body: unknown): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    apiRoutes.auth.google2fa.verify(),
    body,
  );
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
