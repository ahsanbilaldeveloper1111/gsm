/**
 * Centralized React Query keys — import from here only (no duplicated string literals).
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
    token: () => [...queryKeys.auth.all, "token"] as const,
    google2fa: {
      all: () => [...queryKeys.auth.all, "google2fa"] as const,
      verify: () => [...queryKeys.auth.all, "google2fa", "verify"] as const,
    },
  },
  tokenPublic: {
    all: ["tokenPublic"] as const,
  },
  user: {
    all: ["user"] as const,
    me: () => [...queryKeys.user.all, "me"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    index: () => [...queryKeys.dashboard.all, "index"] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    dashboardCounters: () =>
      [...queryKeys.analytics.all, "dashboardCounters"] as const,
    dashboardCharts: () =>
      [...queryKeys.analytics.all, "dashboardCharts"] as const,
    dashboardOverview: () =>
      [...queryKeys.analytics.all, "dashboardOverview"] as const,
    counters: () => [...queryKeys.analytics.all, "counters"] as const,
    index: () => [...queryKeys.analytics.all, "index"] as const,
    revenueTrend: () => [...queryKeys.analytics.all, "revenueTrend"] as const,
    expenseTrend: () => [...queryKeys.analytics.all, "expenseTrend"] as const,
    inventoryStatus: () =>
      [...queryKeys.analytics.all, "inventoryStatus"] as const,
    topProducts: () => [...queryKeys.analytics.all, "topProducts"] as const,
    expenseBreakdown: () =>
      [...queryKeys.analytics.all, "expenseBreakdown"] as const,
    inventoryValue: () =>
      [...queryKeys.analytics.all, "inventoryValue"] as const,
    profitLoss: () => [...queryKeys.analytics.all, "profitLoss"] as const,
    recentActivity: () =>
      [...queryKeys.analytics.all, "recentActivity"] as const,
    productsSpentByCompany: () =>
      [...queryKeys.analytics.all, "productsSpentByCompany"] as const,
    byMonths: () => [...queryKeys.analytics.all, "byMonths"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params: Record<string, unknown> | null) =>
      [...queryKeys.users.all, "list", params] as const,
    detail: (id: number | string | null) =>
      [...queryKeys.users.all, "detail", id] as const,
  },
  vendors: {
    all: ["vendors"] as const,
    list: (params: Record<string, unknown> | null) =>
      [...queryKeys.vendors.all, "list", params] as const,
    detail: (id: number | string | null) =>
      [...queryKeys.vendors.all, "detail", id] as const,
  },
  company: {
    all: ["company"] as const,
    list: (params: Record<string, unknown> | null) =>
      [...queryKeys.company.all, "list", params] as const,
    detail: (id: number | string | null) =>
      [...queryKeys.company.all, "detail", id] as const,
    documents: (tenantId: number | string | null) =>
      [...queryKeys.company.all, "documents", tenantId] as const,
    productPricing: (
      id: number | string | null,
      params: Record<string, unknown> | null,
    ) => [...queryKeys.company.all, "productPricing", id, params] as const,
    discountApplicability: (
      id: number | string | null,
      params: Record<string, unknown> | null,
    ) =>
      [...queryKeys.company.all, "discountApplicability", id, params] as const,
  },
  invoices: {
    all: ["invoices"] as const,
    list: (params: Record<string, unknown> | null) =>
      [...queryKeys.invoices.all, "list", params] as const,
    detail: (id: number | string | null) =>
      [...queryKeys.invoices.all, "detail", id] as const,
  },
  payments: {
    all: ["payments"] as const,
    list: (params: Record<string, unknown> | null) =>
      [...queryKeys.payments.all, "list", params] as const,
    detail: (id: number | string | null) =>
      [...queryKeys.payments.all, "detail", id] as const,
    status: (paymentIntentId: string | null) =>
      [...queryKeys.payments.all, "status", paymentIntentId] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (params: Record<string, unknown> | null) =>
      [...queryKeys.customers.all, "list", params] as const,
    detail: (id: number | string | null) =>
      [...queryKeys.customers.all, "detail", id] as const,
    productPricing: (
      customerId: number | string | null,
      params: Record<string, unknown> | null,
    ) =>
      [
        ...queryKeys.customers.all,
        "productPricing",
        customerId,
        params,
      ] as const,
  },
  crm: {
    all: ["crm"] as const,
    companies: (params: Record<string, unknown> | null) =>
      [...queryKeys.crm.all, "companies", params] as const,
    company: (id: number | string | null) =>
      [...queryKeys.crm.all, "company", id] as const,
  },
  ranks: {
    all: ["ranks"] as const,
    list: (params: Record<string, unknown> | null) =>
      [...queryKeys.ranks.all, "list", params] as const,
    modules: () => [...queryKeys.ranks.all, "modules"] as const,
    detail: (id: number | string | null) =>
      [...queryKeys.ranks.all, "detail", id] as const,
    permissions: (id: number | string | null) =>
      [...queryKeys.ranks.all, "permissions", id] as const,
  },
  auditLogs: {
    all: ["auditLogs"] as const,
    list: (params: Record<string, unknown> | null) =>
      [...queryKeys.auditLogs.all, "list", params] as const,
  },
  email: {
    all: ["email"] as const,
  },
  expenses: {
    all: ["expenses"] as const,
    list: (params: Record<string, unknown> | null) =>
      [...queryKeys.expenses.all, "list", params] as const,
    detail: (id: number | string | null) =>
      [...queryKeys.expenses.all, "detail", id] as const,
  },
  expenseCategories: {
    all: ["expenseCategories"] as const,
    list: (params: Record<string, unknown> | null) =>
      [...queryKeys.expenseCategories.all, "list", params] as const,
    detail: (id: number | string | null) =>
      [...queryKeys.expenseCategories.all, "detail", id] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params: Record<string, unknown> | null) =>
      [...queryKeys.products.all, "list", params] as const,
    detail: (id: number | string | null) =>
      [...queryKeys.products.all, "detail", id] as const,
    active: (params: Record<string, unknown> | null) =>
      [...queryKeys.products.all, "active", params] as const,
    pricing: (
      productId: number | string | null,
      tenantId: number | string | null,
    ) =>
      [...queryKeys.products.all, "pricing", productId, tenantId] as const,
  },
  productCategories: {
    all: ["productCategories"] as const,
    list: (params: Record<string, unknown> | null) =>
      [...queryKeys.productCategories.all, "list", params] as const,
    detail: (id: number | string | null) =>
      [...queryKeys.productCategories.all, "detail", id] as const,
  },
  currencies: {
    all: ["currencies"] as const,
    index: (params: Record<string, unknown> | null) =>
      [...queryKeys.currencies.all, "index", params] as const,
    active: () => [...queryKeys.currencies.all, "active"] as const,
    base: () => [...queryKeys.currencies.all, "base"] as const,
    code: (code: string | null) =>
      [...queryKeys.currencies.all, "code", code] as const,
  },
  reports: {
    all: ["reports"] as const,
    profitLoss: (params: Record<string, unknown> | null) =>
      [...queryKeys.reports.all, "profitLoss", params] as const,
    accountsReceivableAging: () =>
      [...queryKeys.reports.all, "accountsReceivableAging"] as const,
    vatSummary: () => [...queryKeys.reports.all, "vatSummary"] as const,
    customerStatements: () =>
      [...queryKeys.reports.all, "customerStatements"] as const,
    paymentHistory: () =>
      [...queryKeys.reports.all, "paymentHistory"] as const,
    dashboard: () => [...queryKeys.reports.all, "dashboard"] as const,
  },
  stripe: {
    all: ["stripe"] as const,
    publishableKey: () => [...queryKeys.stripe.all, "publishableKey"] as const,
    paymentMethodsForCustomer: (crmCompanyId: string | null) =>
      [...queryKeys.stripe.all, "pmCustomer", crmCompanyId] as const,
    paymentMethods: (profileId: number | string | null) =>
      [...queryKeys.stripe.all, "paymentMethods", profileId] as const,
    incompletePayments: () =>
      [...queryKeys.stripe.all, "incompletePayments"] as const,
    latestTransactionFee: () =>
      [...queryKeys.stripe.all, "latestTransactionFee"] as const,
  },
  inventory: {
    all: ["inventory"] as const,
    list: (params: Record<string, unknown> | null) =>
      [...queryKeys.inventory.all, "list", params] as const,
    detail: (id: number | string | null) =>
      [...queryKeys.inventory.all, "detail", id] as const,
    locations: {
      all: () => [...queryKeys.inventory.all, "locations"] as const,
      detail: (id: number | string | null) =>
        [...queryKeys.inventory.all, "locations", id] as const,
    },
    suppliers: {
      all: () => [...queryKeys.inventory.all, "suppliers"] as const,
      detail: (id: number | string | null) =>
        [...queryKeys.inventory.all, "suppliers", id] as const,
    },
    items: {
      all: () => [...queryKeys.inventory.all, "items"] as const,
      detail: (id: number | string | null) =>
        [...queryKeys.inventory.all, "items", id] as const,
    },
  },
  public: {
    all: ["public"] as const,
    invoicePay: (token: string | null) =>
      [...queryKeys.public.all, "invoicePay", token] as const,
  },
};
