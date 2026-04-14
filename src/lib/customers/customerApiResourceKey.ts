import type { Customer } from "@/models/Customer";

/**
 * Canonical customer key for `/customers/{key}` (show, update, delete) and for
 * `crm_company_id` in create/update bodies: prefer CRM id when present, else internal `id`.
 */
export function customerApiResourceKey(
  c: Pick<Customer, "id" | "crm_company_id">,
): string | number {
  const crm = c.crm_company_id;
  if (crm != null && String(crm).trim() !== "") {
    return String(crm).trim();
  }
  return c.id;
}
