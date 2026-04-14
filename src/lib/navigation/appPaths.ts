/** Browser routes for the Next.js app (not billing backend proxy paths). */
export const appPaths = {
  login: "/login",
  dashboard: "/dashboard",
  /** Same page as dashboard — scrolls to the Analytics charts block. */
  dashboardAnalytics: "/dashboard#analytics",
  /** @deprecated Use `dashboard` + charts / `dashboardAnalytics`; route redirects. */
  analytics: "/analytics",
  users: "/users",
  company: "/company",
  invoices: "/invoices",
  payments: "/payments",
  customers: "/customers",
  expenses: "/expenses",
  expenseCategories: "/expense-categories",
  products: "/products",
  productCategories: "/product-categories",
  currencies: "/currencies",
  reports: "/reports",
  statementOfAccount: "/statement-of-account",
  vendors: "/vendors",
  ranks: "/ranks",
  crm: "/crm",
  auditLogs: "/audit-logs",
  inventory: "/inventory",
  stripe: "/stripe",
} as const;

export type AppPath = (typeof appPaths)[keyof typeof appPaths];

/** Browser URL for a tenant’s product pricing page (`tenant_id` or company key). */
export function companyProductPricingPath(tenantId: string): string {
  return `/company/pricing/${encodeURIComponent(tenantId)}`;
}

/** Browser URL for a customer’s subscription / product pricing (`crm_company_id` or numeric id). */
export function customerProductPricingPath(customerId: string): string {
  return `/customers/pricing/${encodeURIComponent(customerId)}`;
}
