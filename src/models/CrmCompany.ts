import type { Company } from "@/models/Company";

/** Row from `GET /crm/companies` (billing backend). */
export type CrmCompany = Company & {
  company_id?: number;
  company_name?: string;
};

export type CrmCompanyDropdownItem = CrmCompany;
