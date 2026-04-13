import type { PaginationParams } from "@/lib/pagination";

export interface CustomerProfile {
  id?: number;
  crm_company_id?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postal_code?: string | null;
  currency?: string | null;
  vat_rate?: number | string | null;
  vat_exemption?: boolean | null;
  tax_id?: string | null;
  logo?: string | null;
  discount_type?: string | null;
  discount_limit?: number | string | null;
  discount_applicability?: unknown;
  payment_methods?: unknown;
  credit_limit?: number | string | null;
  early_payment_discount?: number | string | null;
  late_fee_rule?: number | string | null;
  payment_terms?: number | null;
}

export interface Customer {
  id: number;
  crm_company_id?: string | null;
  tenant_id?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  profile?: CustomerProfile | null;
  invoices_count?: number;
  created_at?: string;
  updated_at?: string;
}

/** `GET /api/backend/customers` — sort via `order[column]` / `order[dir]`. */
export interface IndexCustomerParams extends PaginationParams {
  search?: string;
  crm_company_id?: string | null;
  tenant_id?: string | null;
  vendor_id?: number;
  email?: string | null;
  phone?: string | null;
  load_profile?: boolean;
  load_invoices_count?: boolean;
  "order[column]"?: string;
  "order[dir]"?: "asc" | "desc";
}

export interface CreateCustomerData {
  crm_company_id?: string | null;
  tenant_id?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  profile?: Partial<CustomerProfile> | null;
}

export type UpdateCustomerData = Partial<CreateCustomerData>;
