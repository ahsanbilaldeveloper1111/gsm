import type { PaginationParams } from "@/lib/pagination";
import type { Reseller } from "@/models/Reseller";

export type ExpenseTaxType = "percentage" | "amount";

export type ExpensePaymentStatus = "pending" | "paid" | "refunded";

export interface ExpenseFile {
  name: string;
  path: string;
  size: number;
  type: string;
  uploaded_at: string;
}

export interface ExpenseCategory {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  parent?: ExpenseCategory;
  children?: ExpenseCategory[];
  expenses?: Expense[];
}

export interface Expense {
  id: number;
  company_id: number;
  crm_company_id?: string | null;
  tenant_id?: string | null;
  reseller_id?: number;
  category_id?: number;
  currency?: string;
  expense_number?: string;
  expense_date: string;
  description: string;
  amount: number;
  exchange_rate?: number;
  tax_amount?: number;
  tax_type?: ExpenseTaxType;
  total_amount?: number;
  receipt_path?: string;
  files?: ExpenseFile[];
  notes?: string;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
  reseller?: Reseller;
}

export interface CreateExpenseData {
  company_id?: number;
  crm_company_id?: string | null;
  reseller_id?: number;
  tenant_id?: string | null;
  category_id?: number;
  currency?: string;
  expense_number?: string;
  expense_date: string;
  description: string;
  amount: number;
  exchange_rate?: number;
  tax_amount?: number;
  tax_type?: ExpenseTaxType;
  total_amount?: number;
  receipt_path?: string;
  files?: File[];
  notes?: string;
}

export interface UpdateExpenseData {
  company_id?: number;
  crm_company_id?: string | null;
  reseller_id?: number;
  category_id?: number;
  currency?: string;
  expense_number?: string;
  expense_date?: string;
  description?: string;
  amount?: number;
  exchange_rate?: number;
  tax_amount?: number;
  tax_type?: ExpenseTaxType;
  total_amount?: number;
  receipt_path?: string;
  files?: File[];
  notes?: string;
}

export interface IndexExpenseParams extends PaginationParams {
  search?: string;
  category_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface ExpenseCategoryStats {
  category_id: number;
  category_name: string;
  expense_count: number;
  total_amount: number;
  percentage: number;
}

export interface MonthlyExpenseTrend {
  month: string;
  amount: number;
  count: number;
}

export interface ExpenseStats {
  total_expenses: number;
  total_amount: number;
  billable_amount: number;
  category_breakdown: ExpenseCategoryStats[];
  monthly_trend: MonthlyExpenseTrend[];
}

export interface VendorExpenseStats {
  vendor_id: number;
  vendor_name: string;
  expense_count: number;
  total_amount: number;
  percentage: number;
}

export interface ExpenseReport {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_expenses: number;
    total_amount: number;
    average_amount: number;
    billable_amount: number;
    non_billable_amount: number;
  };
  by_category: ExpenseCategoryStats[];
  by_vendor: VendorExpenseStats[];
  by_month: MonthlyExpenseTrend[];
}
