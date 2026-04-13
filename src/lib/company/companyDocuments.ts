import { unwrapApiSuccessData } from "@/lib/dashboard/unwrapAnalyticsPayload";
import type { CompanyDocument } from "@/models/Company";

/** Normalizes list payload from `GET …/company/{tenantId}/documents`. */
export function getCompanyDocumentsList(
  documentsData: unknown,
): CompanyDocument[] {
  const unwrapped = unwrapApiSuccessData<CompanyDocument[]>(documentsData);
  if (Array.isArray(unwrapped)) return unwrapped;
  if (
    documentsData != null &&
    typeof documentsData === "object" &&
    "data" in documentsData
  ) {
    const d = (documentsData as { data: unknown }).data;
    if (Array.isArray(d)) return d as CompanyDocument[];
  }
  return [];
}

export function getDocumentNameFromFile(file: File): string {
  const base = file.name.replace(/\.[^/.]+$/, "").trim() || file.name;
  const sanitized = base
    .replace(/[^a-zA-Z0-9_\-. ]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 200);
  return sanitized || "Document";
}

export function getDocumentTypeFromFile(file: File): string {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const mime = (file.type || "").toLowerCase();
  if (["pdf"].includes(ext) || mime.includes("pdf")) return "PDF";
  if (
    ["doc", "docx"].includes(ext) ||
    mime.includes("word") ||
    mime.includes("document")
  ) {
    return "Document";
  }
  if (
    ["jpg", "jpeg", "png", "gif"].includes(ext) ||
    mime.startsWith("image/")
  ) {
    return "Image";
  }
  return ext ? ext.toUpperCase() : "File";
}
