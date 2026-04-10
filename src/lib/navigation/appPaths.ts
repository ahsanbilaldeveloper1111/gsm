/** Browser routes for the Next.js app (not Laravel API paths). */
export const appPaths = {
  dashboard: "/dashboard",
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
