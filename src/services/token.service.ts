import { setStoredToken } from "@/lib/auth/token-store";

export type BootstrapTokenResult = {
  token: string;
};

/**
 * Obtains a JWT via the Next.js route handler (GET/POST Laravel `/api/get-token` server-side).
 * Persists the token for subsequent Axios (`apiClient`) requests.
 */
export async function bootstrapTokenFromServer(): Promise<string> {
  const res = await fetch("/api/auth/laravel-token", {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  const json: unknown = await res.json();
  if (!res.ok) {
    const msg =
      typeof json === "object" && json && "error" in json
        ? String((json as { error?: string }).error)
        : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  const token =
    typeof json === "object" &&
    json &&
    "token" in json &&
    typeof (json as { token?: unknown }).token === "string"
      ? (json as { token: string }).token
      : null;
  if (!token) {
    throw new Error("Invalid token response from /api/auth/laravel-token");
  }
  setStoredToken(token);
  return token;
}
