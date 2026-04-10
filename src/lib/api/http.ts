import { apiClient } from "@/lib/api/axios-client";

export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

export function cleanParams(
  params?: QueryParams,
): Record<string, string> | undefined {
  if (!params || Object.keys(params).length === 0) return undefined;
  const e = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "" && v !== null,
  );
  if (e.length === 0) return undefined;
  return Object.fromEntries(e.map(([k, v]) => [k, String(v)]));
}

export async function apiGet<T = unknown>(
  path: string,
  params?: QueryParams,
): Promise<T> {
  const { data } = await apiClient.get<T>(path, { params: cleanParams(params) });
  return data;
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  const { data } = await apiClient.delete<T>(path);
  return data;
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
): Promise<T> {
  const { data } = await apiClient.post<T>(path, body);
  return data;
}

export async function apiPut<T = unknown>(
  path: string,
  body?: unknown,
): Promise<T> {
  const { data } = await apiClient.put<T>(path, body);
  return data;
}

export async function apiPatch<T = unknown>(
  path: string,
  body?: unknown,
): Promise<T> {
  const { data } = await apiClient.patch<T>(path, body);
  return data;
}

/** Multipart — `is_super_user` is appended in the Axios interceptor. */
export async function apiPostForm<T = unknown>(
  path: string,
  formData: FormData,
): Promise<T> {
  const { data } = await apiClient.post<T>(path, formData);
  return data;
}

export async function apiGetBlob(
  path: string,
  params?: QueryParams,
): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(path, {
    params: cleanParams(params),
    responseType: "blob",
  });
  return data;
}
