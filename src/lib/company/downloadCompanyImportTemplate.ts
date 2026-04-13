import { companyService } from "@/services/company.service";

/** Triggers a browser download of the CSV import template from the billing API. */
export async function downloadCompanyImportTemplate(): Promise<void> {
  const blob = await companyService.downloadTemplate({ format: "csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "company_import_template.csv";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
