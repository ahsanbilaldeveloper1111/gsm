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
  vendors: "/vendors",
  ranks: "/ranks",
  crm: "/crm",
  auditLogs: "/audit-logs",
  inventory: "/inventory",
  stripe: "/stripe",
} as const;

export type AppPath = (typeof appPaths)[keyof typeof appPaths];
