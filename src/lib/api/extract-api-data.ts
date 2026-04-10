import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

export function getApiData<T>(
  res: ApiSuccessResponse<T> | undefined | null,
): T | undefined {
  return res?.data ?? undefined;
}

export type ExtractedList<T = Record<string, unknown>> = {
  rows: T[];
  pagination?: ApiPagination;
};

/**
 * Normalizes Laravel list payloads: `data: T[]` or nested `data: { data: T[], ... }`.
 */
export function extractListRows<T extends Record<string, unknown>>(
  res: ApiSuccessResponse<unknown> | undefined | null,
): ExtractedList<T> {
  if (res === undefined || res === null) {
    return { rows: [] };
  }
  const raw = res.data;
  const pagination = res.pagination;

  if (Array.isArray(raw)) {
    return { rows: raw as T[], pagination };
  }
  if (raw && typeof raw === "object" && "data" in raw) {
    const inner = (raw as { data?: unknown; pagination?: ApiPagination }).data;
    const nestedPag = (raw as { pagination?: ApiPagination }).pagination;
    if (Array.isArray(inner)) {
      return {
        rows: inner as T[],
        pagination: pagination ?? nestedPag,
      };
    }
  }
  return { rows: [], pagination };
}

export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
