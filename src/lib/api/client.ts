import type { RawAxiosRequestHeaders } from "axios";
import { getApiClient } from "@/lib/api/axiosClient";

function headersToObject(h: HeadersInit | undefined): RawAxiosRequestHeaders | undefined {
  if (!h) return undefined;
  if (h instanceof Headers) {
    const o: Record<string, string> = {};
    h.forEach((v, k) => {
      o[k] = v;
    });
    return o;
  }
  if (Array.isArray(h)) {
    return Object.fromEntries(h);
  }
  return h as RawAxiosRequestHeaders;
}

/**
 * JSON helpers on top of the shared Axios client (same `is_super_user` + Bearer behavior).
 * Prefer importing `apiClient` from `@/lib/api/axiosClient` in new code.
 */
export async function apiFetchJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = headersToObject(init.headers);
  const hasBody =
    init.body != null && !["GET", "HEAD"].includes(method);

  let data: unknown;
  if (hasBody) {
    if (typeof init.body === "string") {
      try {
        data = JSON.parse(init.body);
      } catch {
        data = init.body;
      }
    } else {
      data = init.body;
    }
  }

  const client = getApiClient();
  const res = await client.request<T>({
    url: path,
    method,
    headers,
    data: hasBody ? data : undefined,
  });
  return res.data;
}
