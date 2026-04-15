import axios from "axios";

type JsonObject = Record<string, unknown>;

export type TelecomPagination = {
  current_page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
  from?: number;
  to?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  draw?: number;
  start?: number;
  length?: number;
};

export type TelecomNormalizedList<T = JsonObject> = {
  rows: T[];
  pagination?: TelecomPagination;
  summary?: unknown;
  meta?: unknown;
  message?: string;
};

function asObject(v: unknown): JsonObject | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as JsonObject;
}

function toFiniteNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function assertTelecomBusinessSuccess(payload: unknown): void {
  const obj = asObject(payload);
  if (!obj || !("code" in obj)) return;
  const code = toFiniteNumber(obj.code);
  if (code === undefined || code === 200) return;
  const message =
    typeof obj.message === "string" && obj.message.trim()
      ? obj.message.trim()
      : `Request failed with business code ${String(obj.code)}`;
  const err = new Error(message) as Error & { payload?: unknown };
  err.payload = payload;
  throw err;
}

function extractRows<T = JsonObject>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const obj = asObject(payload);
  if (!obj) return [];
  if (Array.isArray(obj.data)) return obj.data as T[];
  if (Array.isArray(obj.dataList)) return obj.dataList as T[];
  return [];
}

function extractPagination(payload: unknown): TelecomPagination | undefined {
  const obj = asObject(payload);
  if (!obj) return undefined;
  const p: TelecomPagination = {};
  p.current_page = toFiniteNumber(obj.current_page);
  p.per_page = toFiniteNumber(obj.per_page);
  p.total = toFiniteNumber(obj.total);
  p.last_page = toFiniteNumber(obj.last_page);
  p.from = toFiniteNumber(obj.from);
  p.to = toFiniteNumber(obj.to);
  p.recordsTotal = toFiniteNumber(obj.recordsTotal);
  p.recordsFiltered = toFiniteNumber(obj.recordsFiltered);
  p.draw = toFiniteNumber(obj.draw);
  p.start = toFiniteNumber(obj.start);
  p.length = toFiniteNumber(obj.length);
  return Object.values(p).some((v) => v !== undefined) ? p : undefined;
}

export function normalizeTelecomListResponse<T = JsonObject>(
  payload: unknown,
): TelecomNormalizedList<T> {
  assertTelecomBusinessSuccess(payload);

  const root = asObject(payload);
  const message =
    root && typeof root.message === "string" ? root.message : undefined;

  const rootRows = extractRows<T>(payload);
  if (rootRows.length > 0) {
    return {
      rows: rootRows,
      pagination: extractPagination(payload),
      summary: root?.summary,
      meta: root?.meta,
      message,
    };
  }

  const data = root?.data;
  const nestedRows = extractRows<T>(data);
  return {
    rows: nestedRows,
    pagination: extractPagination(data),
    summary: root?.summary ?? asObject(data)?.summary,
    meta: root?.meta ?? asObject(data)?.meta,
    message,
  };
}

export function normalizeTelecomDataResponse<T = unknown>(payload: unknown): T {
  assertTelecomBusinessSuccess(payload);
  const obj = asObject(payload);
  if (!obj) return payload as T;
  if ("data" in obj) return obj.data as T;
  return payload as T;
}

export function toTelecomError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  if (axios.isAxiosError(error)) {
    const message =
      typeof error.response?.data === "object" &&
      error.response?.data &&
      "message" in (error.response.data as Record<string, unknown>) &&
      typeof (error.response.data as Record<string, unknown>).message === "string"
        ? String((error.response.data as Record<string, unknown>).message)
        : error.message;
    return new Error(message);
  }
  return new Error("Unexpected request error.");
}
