import { extractListRows } from "@/lib/api/extractApiData";
import type { ApiSuccessResponse } from "@/lib/api/types";

const DEFAULT_LABEL_KEYS = [
  "name",
  "invoice_number",
  "title",
  "username",
  "email",
] as const;

/**
 * Finds a human-readable label for the row being deleted (for confirmation UI).
 */
export function resolveDeleteItemLabel(
  listData: ApiSuccessResponse<unknown> | undefined,
  deleteId: string | number | null,
  options?: {
    idKey?: string;
    labelKeys?: readonly string[];
  },
): string | undefined {
  if (deleteId == null) return undefined;
  const { rows } = extractListRows(listData);
  const idKey = options?.idKey ?? "id";
  const labelKeys = options?.labelKeys ?? DEFAULT_LABEL_KEYS;
  const row = rows.find((r) => {
    if (typeof r !== "object" || r === null) return false;
    const rec = r as Record<string, unknown>;
    return String(rec[idKey]) === String(deleteId);
  });
  if (!row || typeof row !== "object") return undefined;
  const rec = row as Record<string, unknown>;
  for (const k of labelKeys) {
    const v = rec[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}
