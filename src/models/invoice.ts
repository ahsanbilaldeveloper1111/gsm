import type { PaginationParams } from "@/lib/pagination";
import type { Company } from "@/models/company";
import type { Customer } from "@/models/customer";
import type { Payment, PaymentMode } from "@/models/payment";
import type { Product } from "@/models/product";
import type { Reseller } from "@/models/reseller";
import type { Vendor } from "@/models/vendor";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "pending"
  | "partially_paid"
  | "overdue"
  | "cancelled";

export type { PaymentMode } from "@/models/payment";

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
  reseller?: Reseller;
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
  vat_rate?: number;
}

export interface CreateInvoiceData {
  tenant_id?: string | null;
  crm_company_id?: string | null;
  po_number?: string | null;
  invoice_date: string;
  due_date: string;
  end_date?: string;
  payment_mode: PaymentMode;
  currency_code: string;
  exchange_rate?: number;
  tax_amount?: number;
  notes?: string;
  terms_conditions?: string;
  items: CreateInvoiceItemData[];
}

export interface UpdateInvoiceData {
  tenant_id?: string | null;
  po_number?: string | null;
  invoice_date?: string;
  company?: Company;
  due_date?: string;
  end_date?: string;
  payment_mode?: PaymentMode;
  currency_code?: string;
  exchange_rate?: number;
  notes?: string;
  terms_conditions?: string;
  items?: CreateInvoiceItemData[];
}

export interface IndexInvoiceParams extends Partial<PaginationParams> {
  tenant_id?: string | null;
  vendor_id?: number | string | null;
  crm_company_id?: string | null;
  status?: InvoiceStatus;
  date_from?: string;
  date_to?: string;
  sort_field?: string;
  sort_direction?: "asc" | "desc";
}
