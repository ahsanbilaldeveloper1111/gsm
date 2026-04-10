/**
 * Barrel for React Query hooks aligned with `src/services/*`.
 * Prefer importing from here for discoverability, or from feature folders.
 */

export * from "@/hooks/analytics/use-analytics-dashboard-counters";
export * from "@/hooks/analytics/use-analytics-dashboard-charts";
export * from "@/hooks/analytics/use-analytics-dashboard-overview";
export * from "@/hooks/analytics/use-analytics-endpoints";

export * from "@/hooks/audit-logs/use-audit-logs";

export * from "@/hooks/auth/use-auth-mutations";
export * from "@/hooks/auth/use-current-user";
export * from "@/hooks/auth/use-login";

export * from "@/hooks/company/use-companies";
export * from "@/hooks/company/use-company";

export * from "@/hooks/crm/use-crm-companies";

export * from "@/hooks/currencies/use-active-currencies";
export * from "@/hooks/currencies/use-base-currency";
export * from "@/hooks/currencies/use-currencies";
export * from "@/hooks/currencies/use-currency-map";

export * from "@/hooks/customers/use-customer";
export * from "@/hooks/customers/use-customers";

export * from "@/hooks/dashboard/use-dashboard";
export * from "@/hooks/dashboard/use-dashboard-params";

export * from "@/hooks/email/use-send-email";

export * from "@/hooks/expense-categories/use-expense-categories";
export * from "@/hooks/expenses/use-expense";
export * from "@/hooks/expenses/use-expense-mutations";
export * from "@/hooks/expenses/use-expenses";

export * from "@/hooks/inventory/use-inventory";
export * from "@/hooks/inventory/use-inventory-endpoints";

export * from "@/hooks/invoices/use-invoice";
export * from "@/hooks/invoices/use-invoice-details";
export * from "@/hooks/invoices/use-invoices";

export * from "@/hooks/payments/use-payment";
export * from "@/hooks/payments/use-payment-status";
export * from "@/hooks/payments/use-payments";

export * from "@/hooks/permissions";

export * from "@/hooks/product-categories/use-product-categories";

export * from "@/hooks/products/use-product";
export * from "@/hooks/products/use-products";

export * from "@/hooks/public-api/use-public-invoice-pay";

export * from "@/hooks/ranks/use-ranks";

export * from "@/hooks/reports/use-reports-dashboard";
export * from "@/hooks/reports/use-reports-endpoints";

export * from "@/hooks/stripe/use-stripe-endpoints";
export * from "@/hooks/stripe/use-stripe-publishable-key";

export * from "@/hooks/token-public/use-token-public";

export * from "@/hooks/users/use-user";
export * from "@/hooks/users/use-users";

export * from "@/hooks/use-auth-query-enabled";

export * from "@/hooks/vendors/use-vendor";
export * from "@/hooks/vendors/use-vendors";
