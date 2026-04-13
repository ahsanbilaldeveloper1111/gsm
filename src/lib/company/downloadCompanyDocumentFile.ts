import { companyService } from "@/services/company.service";

export async function downloadCompanyDocumentFile(
  tenantId: string | number,
  documentId: number | string,
): Promise<Blob> {
  return companyService.downloadDocument(tenantId, documentId);
}
