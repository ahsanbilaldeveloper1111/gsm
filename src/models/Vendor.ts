import type { PaginationParams } from "@/lib/pagination";
import type { Company } from "@/models/Company";

export interface Vendor {
  id: number;
  name: string;
  email?: string;
  status?: VendorStatus;
  phone?: string;
  bank_accounts?: VendorBankAccount[];
  companies_count?: number;
  companies?: Company[];
  profile?: VendorProfile;
}

export interface VendorProfile {
  id?: number;
  vendor_id: number;
  address?: string;
  country?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  business_type?: string;
  tax_id?: string;
  status?: string;
  allowed_products?: string[];
  allowed_categories?: string[];
  reseller_type?: string;
  payment_terms?: number;
  currency?: string;
  vat_exemption?: boolean;
  /** VAT rate percentage (profile). */
  vat_rate?: number;
  main_app_visibility?: boolean;
  invoice_delivery_methods?: string[];
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  logo?: string | null;
  logo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Backward-compatible alias for `VendorProfile`. */
export type Profile = VendorProfile;

export interface VendorBankAccount {
  id?: number;
  vendor_id?: number;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  routing_number?: string;
  swift_code?: string;
  iban?: string;
  currency: string;
  account_type?: string;
  is_default: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/** `GET /api/vendors` — query keys match Laravel `VendorController`/FormRequest. */
export interface IndexVendorParams extends PaginationParams {
  search?: string;
  email?: string;
  phone?: string;
  load_resellers?: boolean;
  load_companies?: boolean;
  load_profile?: boolean;
  "order[column]"?: string;
  "order[dir]"?: "asc" | "desc";
}

export enum VendorStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  SUSPENDED = "suspended",
}
