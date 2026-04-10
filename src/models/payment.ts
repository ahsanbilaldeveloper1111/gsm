import type { PaginationParams } from "@/lib/pagination";
import type { Invoice } from "@/models/invoice";
import type { User } from "@/models/user";

export type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "cheque"
  | "stripe"
  | "card_payment";

export type PaymentMode = "one_time" | "recurring" | "subscription";

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "partially_paid"
  | "cancelled";

export interface PaymentEvidence {
  name: string;
  path: string;
  size: number;
  type: string;
  uploaded_at: string;
}

export interface Payment {
  id: number;
  company_id?: number;
  tenant_id?: string | null;
  crm_company_id?: string | null;
  invoice_id: number;
  /** Includes processing_fee (amount = base + processing_fee). */
  amount: number;
  processing_fee?: number;
  currency_code: string;
  exchange_rate: number;
  payment_method: PaymentMethod;
  payment_mode: PaymentMode;
  status: PaymentStatus;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  payment_evidence?: PaymentEvidence[];
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  processed_by: number;
  created_at: string;
  updated_at: string;
  invoice?: Invoice;
  processedBy?: User;
}

export interface CreatePaymentData {
  invoice_id: number;
  amount: number;
  processing_fee?: number;
  /** Base amount before processing fee. */
  base_amount?: number;
  currency_code?: string;
  exchange_rate?: number;
  payment_method: string;
  payment_mode?: PaymentMode;
  payment_date?: string;
  payment_method_id?: string;
  reference_number?: string;
  notes?: string;
  stripe_payment_intent_id?: string;
  consent_given?: boolean;
  /** Optional: frontend can generate to prevent duplicate payments. */
  idempotency_key?: string;
}

export interface CreateRefundData {
  payment_id: number;
  amount: number;
  reason?: string;
  notes?: string;
}

export interface UpdatePaymentData {
  amount?: number;
  currency_code?: string;
  exchange_rate?: number;
  payment_method?: PaymentMethod;
  payment_mode?: PaymentMode;
  payment_date?: string;
  reference_number?: string;
  notes?: string;
}

export interface IndexPaymentParams extends PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  invoice_id?: number;
  vendor_id?: number | string | null;
  tenant_id?: string | null;
  crm_company_id?: string | null;
  payment_method?: PaymentMethod;
  status?: PaymentStatus;
  company_id?: number;
  date_from?: string;
  date_to?: string;
  order?: {
    column: string;
    dir: "asc" | "desc";
  };
}

export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  by_method: PaymentMethodStats[];
  monthly_trend: MonthlyPaymentTrend[];
}

export interface PaymentMethodStats {
  method: PaymentMethod;
  count: number;
  amount: number;
  percentage: number;
}

export interface MonthlyPaymentTrend {
  month: string;
  amount: number;
  count: number;
}

export interface PaymentReport {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_payments: number;
    total_amount: number;
    average_amount: number;
    success_rate: number;
  };
  by_method: PaymentMethodStats[];
  by_month: MonthlyPaymentTrend[];
}
