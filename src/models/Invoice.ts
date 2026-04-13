import type { PaginationParams } from "@/lib/pagination";
import type { Company } from "@/models/Company";
import type { Customer } from "@/models/Customer";
import type { Payment, PaymentMode } from "@/models/Payment";
import type { Product } from "@/models/Product";
import type { Vendor } from "@/models/Vendor";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "pending"
  | "partially_paid"
  | "overdue"
  | "cancelled";

export type { PaymentMode } from "@/models/Payment";

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  product_id?: number;
  product?: Product;
  description?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  tax_rate: number;
  tax_amount?: number;
}

export interface Invoice {
  id: number;
  company_id?: number;
  vendor_id?: number | null;
  tenant_id?: string | null;
  crm_company_id?: string | null;
  invoice_number: string;
  po_number?: string | null;
  invoice_date: string;
  due_date: string;
  end_date?: string;
  status: InvoiceStatus;
  payment_mode: PaymentMode;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency_code: string;
  exchange_rate: number;
  notes?: string;
  terms_conditions?: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  recurring_end_date?: string;
  parent_invoice_id?: number;
  stripe_payment_link?: string | null;
  payment_link_token?: string | null;
  payment_link_expires_at?: string | null;
  stripe_checkout_url?: string | null;
  stripe_checkout_session_id?: string | null;
  stripe_checkout_expires_at?: string | null;
  stripe_payment_link_id?: string | null;
  stripe_payment_link_url?: string | null;
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  company?: Company;
  vendor?: Vendor;
  customer?: Customer;
  items?: InvoiceItem[];
  payments?: Payment[];
  parentInvoice?: Invoice;
  recurringInvoices?: Invoice[];
  paid_amount?: number;
  outstanding_amount?: number;
  amount_due?: number;
  is_overdue?: boolean;
}

export interface CreateInvoiceItemData {
  product_id?: number;
  quantity: number;
  unit_price: number;
  /** Alias for `tax_rate` in some validators — send either or both. */
  vat_rate?: number;
  tax_rate?: number;
  description?: string;
}

/**
 * `POST /invoices` body — aligns with `Invoice\StoreRequest` (tenant + amounts + line items).
 */
export interface CreateInvoiceData {
  /** Required: must exist on `companies.tenant_id`. */
  tenant_id: string;
  vendor_id?: number | null;
  crm_company_id?: string | null;
  po_number?: string | null;
  invoice_date: string;
  due_date: string;
  end_date?: string;
  payment_mode: PaymentMode;
  subtotal: number;
  total_amount: number;
  tax_amount?: number;
  currency_code: string;
  exchange_rate?: number;
  notes?: string;
  terms_conditions?: string;
  is_recurring?: boolean;
  recurring_frequency?: string;
  recurring_end_date?: string;
  items: CreateInvoiceItemData[];
}

export interface UpdateInvoiceData {
  tenant_id?: string | null;
  vendor_id?: number | null;
  po_number?: string | null;
  invoice_date?: string;
  company?: Company;
  due_date?: string;
  end_date?: string;
  payment_mode?: PaymentMode;
  subtotal?: number;
  total_amount?: number;
  tax_amount?: number;
  currency_code?: string;
  exchange_rate?: number;
  notes?: string;
  terms_conditions?: string;
  status?: InvoiceStatus;
  items?: CreateInvoiceItemData[];
}

export interface IndexInvoiceParams extends Partial<PaginationParams> {
  search?: string;
  tenant_id?: string | null;
  vendor_id?: number | string | null;
  crm_company_id?: string | null;
  /** CRM sentinel: empty or literal `null` string may mean “no CRM” per backend. */
  status?: InvoiceStatus;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  sort_field?: string;
  sort_direction?: "asc" | "desc";
  crm_company_not_null?: boolean;
}
