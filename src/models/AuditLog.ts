import type { PaginationParams } from "@/lib/pagination";
import type { Company } from "@/models/Company";
import type { User } from "@/models/User";
import type { Vendor } from "@/models/Vendor";

export interface AuditLogChange {
  field: string;
  type: "added" | "removed" | "changed";
  old?: string;
  new?: string;
}

export enum AuditLogResourceType {
  RANK = "rank",
  PERMISSION = "permission",
  USER = "user",
  COMPANY = "company",
  AUDIT_LOG = "audit_log",
  INVOICE = "invoice",
  PAYMENT = "payment",
  EXPENSE = "expense",
  PRODUCT = "product",
  PRODUCT_CATEGORY = "product_category",
  EXPENSE_CATEGORY = "expense_category",
}

export interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  extension_number?: string;
  resource_type: AuditLogResourceType;
  old_values: unknown;
  action: string;
  new_values: unknown;
  ip_address: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
  tenant_id?: string | null;
  vendor_id?: number | null;
  crm_company_id?: string | null;
  user: User;
  company?: Company | null;
  vendor?: Vendor | null;
  customer?: { name?: string; email?: string } | null;
  formatted_action?: string;
  formatted_resource_type?: string;
  formatted_timestamp?: string;
  changes_summary?: AuditLogChange[];
  description?: string;
}

export interface IndexAuditLogParams extends PaginationParams {
  search?: string;
  user_id?: number;
  company_id?: number;
  resource_type?: AuditLogResourceType | string;
  date_from?: string;
  date_to?: string;
  action?: string;
  tenant_id?: string | null;
  vendor_id?: number | null;
  crm_company_id?: string | null;
}

export interface AuditLogSummary {
  total: number;
  created: number;
  updated: number;
  deleted: number;
}

export interface AuditLogListEnvelope {
  code?: number;
  message?: string;
  data?: {
    current_page?: number;
    data?: AuditLog[];
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  summary?: AuditLogSummary;
}
