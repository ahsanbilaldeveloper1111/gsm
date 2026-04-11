import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { getPublicApiBaseUrl } from "@/lib/env";
import { getStoredToken } from "@/lib/auth/tokenStore";

/** Node-only: browser TLS is controlled by the browser; this applies to SSR / server usage. */
function getNodeHttpsAgent(): import("https").Agent | undefined {
  if (typeof window !== "undefined") return undefined;
  if (process.env.API_TLS_INSECURE !== "1") return undefined;
  // Avoid bundling `node:https` for the client — only loaded on the server when env is set.
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Node-only TLS agent; not imported at top level
  const https = require("node:https") as typeof import("node:https");
  return new https.Agent({ rejectUnauthorized: false });
}

const SUPER_Q = "is_super_user";
const SUPER_V = "1";

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
  if (typeof d === "object" && !Array.isArray(d)) {
    config.data = { ...(d as Record<string, unknown>), is_super_user: 1 };
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
    config.params = {
      ...(typeof config.params === "object" && config.params !== null
        ? config.params
        : {}),
      [SUPER_Q]: SUPER_V,
    };

    const token = getStoredToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    if (!config.headers.get("Accept") && !config.headers.get("accept")) {
      config.headers.set("Accept", "application/json");
    }

    const method = (config.method ?? "get").toLowerCase();
    if (["post", "put", "patch"].includes(method)) {
      mergeJsonBody(config);
    }

    return config;
  });
}

let _client: AxiosInstance | null = null;

/**
 * Singleton Axios instance for Laravel `/api`:
 * - `is_super_user=1` on every request (query + JSON/FormData body when applicable)
 * - `Authorization: Bearer <jwt>` when a token is stored
 * - Server-side only: `API_TLS_INSECURE=1` sets `https.Agent({ rejectUnauthorized: false })` (same as laravel-token route)
 */
export function getApiClient(): AxiosInstance {
  if (!_client) {
    _client = axios.create({
      baseURL: getPublicApiBaseUrl(),
      headers: { Accept: "application/json" },
      validateStatus: (status) => status >= 200 && status < 300,
      httpsAgent: getNodeHttpsAgent(),
    });
    applyRequestInterceptors(_client);
  }
  return _client;
}

/** Singleton — use in services (`apiClient.get`, `apiClient.post`, …). */
export const apiClient = getApiClient();
