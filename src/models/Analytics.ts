export interface AnalyticCounterResponse {
  total_company_count: number;
  total_customer_count: number;
}

export interface AnalyticsData {
  success: boolean;
  data: unknown;
  message?: string;
  code?: number;
}

export interface DashboardOverview {
  total_companies: number;
  total_customers: number;
}

export interface DashboardCounters {
  companies: {
    total: number;
    active?: number;
    inactive?: number;
  };
  customers?: {
    total: number;
  };
  products?: {
    total: number;
  };
  resellers: {
    total: number;
    active: number;
    inactive: number;
  };
  invoices: {
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    cancelled: number;
    total_amount: number;
    total_amount_with_fees?: number;
    total_subtotal?: number;
    total_tax_amount?: number;
    total_processing_fee?: number;
    total_tax_paid_invoices?: number;
    total_subtotal_paid_invoices?: number;
    prev_month_total_amount: number;
    paid_amount: number;
    partially_paid_amount: number;
    outstanding_amount: number;
    overdue_amount: number;
    overdue_invoices_count: number;
    total_processing_fees?: number;
    paid_invoices_count?: number;
    partially_paid_invoices_count?: number;
    unpaid_invoices_count?: number;
  };
  expenses: {
    total: number;
    total_amount: number;
    this_month: number;
    last_month: number;
  };
  inventory: {
    total_items: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
    total_value: number;
    categories: number;
  };
  categories: {
    product_categories: number;
    expense_categories: number;
    total_categories: number;
  };
}

export interface RevenueTrendItem {
  month: string;
  revenue: number;
  invoice_count: number;
}

export interface ExpenseTrendItem {
  month: string;
  expenses: number;
  expense_count: number;
}

export interface InventoryStatusDistribution {
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
}

export interface TopSellingProduct {
  name: string;
  id: number;
  total_quantity: number;
  total_revenue: number;
}

export interface ExpenseBreakdownItem {
  category_name: string;
  total_amount: number;
  expense_count: number;
}

export interface InventoryValueItem {
  category_name: string;
  total_value: number;
  item_count: number;
}

export interface RecentActivitySummary {
  invoices_created: number;
  expenses_created: number;
  inventory_updated: number;
  companies_created: number;
  customers_created?: number;
}

export interface ProfitLossSummary {
  total_revenue: number;
  total_expenses: number;
  processing_fees?: number;
  net_profit: number;
  profit_margin: number;
}

export interface DashboardChartsData {
  revenue_trend: RevenueTrendItem[];
  expense_trend: ExpenseTrendItem[];
  inventory_status: InventoryStatusDistribution;
  expense_breakdown: ExpenseBreakdownItem[];
  inventory_value: InventoryValueItem[];
  top_products: TopSellingProduct[];
}

export interface ProductSpentByCompany {
  product_id: number;
  product_name: string;
  total_paid_amount: number;
}
