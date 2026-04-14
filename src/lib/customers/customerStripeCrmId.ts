import { customerApiResourceKey } from "@/lib/customers/customerApiResourceKey";
import type { Customer } from "@/models/Customer";

/**
 * Stripe customer routes use the same identifier as customer update (`crm_company_id ?? id`).
 */
export function customerStripeCrmId(
  customer: Customer | null | undefined,
): string | null {
  if (!customer) return null;
  return String(customerApiResourceKey(customer));
}
