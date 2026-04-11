/**
 * Path builders for the billing backend — relative to Axios `baseURL` = `{origin}/api/backend`
 * (Axios `baseURL` is `/api/billing-backend` in the browser; on the server, `getInternalNextOrigin()` + that path.)
 * Example: `/user` → `GET https://host/api/backend/user` (Sanctum Bearer).
 */
export function createApiRoutes(base: string) {
  const b = base.replace(/\/$/, "");

  return {
    token: {
      getToken: () => `${b}/get-token`,
      getTokenPost: () => `${b}/get-token`,
      refreshToken: () => `${b}/refresh-token`,
      getRefreshToken: () => `${b}/get-refresh-token`,
    },
    auth: {
      login: () => `${b}/login`,
      logout: () => `${b}/logout`,
      user: () => `${b}/user`,
      google2fa: ((g: string) => ({
        verify: () => `${g}/verify`,
        enable: () => `${g}/enable`,
        disable: () => `${g}/disable`,
        generateNewSecret: () => `${g}/generate-new-secret`,
      }))(`${b}/google2fa`),
    },
    users: ((x: string) => ({
      index: () => `${x}`,
      show: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      update: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      destroy: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      updatePasswordByUsername: (username: string) =>
        `${x}/update-password/${encodeURIComponent(username)}`,
      updatePassword: (id: number | string) =>
        `${x}/update-password/${encodeURIComponent(String(id))}`,
      updateSetting: (id: number | string) =>
        `${x}/update-setting/${encodeURIComponent(String(id))}`,
    }))(`${b}/users`),
    auditLogs: () => `${b}/audit-logs`,
    sendEmail: () => `${b}/send-email`,
    vendors: ((x: string) => ({
      index: () => `${x}`,
      store: () => `${x}`,
      show: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      update: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      destroy: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
    }))(`${b}/vendors`),
    crm: ((x: string) => ({
      companies: () => `${x}/companies`,
      company: (id: number | string) =>
        `${x}/companies/${encodeURIComponent(String(id))}`,
    }))(`${b}/crm`),
    ranks: ((x: string) => ({
      index: () => `${x}`,
      store: () => `${x}`,
      show: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      update: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      destroy: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      duplicate: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/duplicate`,
      permissions: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/permissions`,
      moduleList: () => `${x}/module-list`,
    }))(`${b}/ranks`),
    company: ((x: string) => ({
      index: () => `${x}`,
      import: () => `${x}/import`,
      export: () => `${x}/export`,
      generateTemplate: () => `${x}/generate-template`,
      downloadTemplate: () => `${x}/download-template`,
      createUpdateProfile: () => `${x}/create-update-profile`,
      createUpdate: () => `${x}/create-update`,
      delete: (id: number | string) =>
        `${x}/delete/${encodeURIComponent(String(id))}`,
      show: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      discountApplicability: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/discount-applicability`,
      updateDiscountApplicability: (
        id: number | string,
        applicabilityId: number | string,
      ) =>
        `${x}/${encodeURIComponent(String(id))}/discount-applicability/${encodeURIComponent(String(applicabilityId))}`,
      productPricingList: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/product-pricing-list`,
      productPricingListGlobal: () => `${x}/product-pricing-list`,
      discountApplicabilityList: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/discount-applicability-list`,
      productPricing: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/product-pricing`,
      bulkUpdateProductPricing: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/product-pricing/bulk-update`,
      deleteProductPricing: (id: number | string, productId: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/product-pricing/${encodeURIComponent(String(productId))}`,
      documents: (tenantId: number | string) =>
        `${x}/${encodeURIComponent(String(tenantId))}/documents`,
      deleteDocument: (
        tenantId: number | string,
        documentId: number | string,
      ) =>
        `${x}/${encodeURIComponent(String(tenantId))}/documents/${encodeURIComponent(String(documentId))}`,
      downloadDocument: (tenantId: number | string, documentId: number | string) =>
        `${x}/${encodeURIComponent(String(tenantId))}/documents/${encodeURIComponent(String(documentId))}/download`,
    }))(`${b}/company`),
    dashboard: () => `${b}/dashboard`,
    analytics: ((x: string) => ({
      dashboardCounters: () => `${x}/dashboard-counters`,
      dashboardCharts: () => `${x}/dashboard-charts`,
      revenueTrend: () => `${x}/revenue-trend`,
      expenseTrend: () => `${x}/expense-trend`,
      inventoryStatus: () => `${x}/inventory-status`,
      topProducts: () => `${x}/top-products`,
      expenseBreakdown: () => `${x}/expense-breakdown`,
      inventoryValue: () => `${x}/inventory-value`,
      recentActivity: () => `${x}/recent-activity`,
      profitLoss: () => `${x}/profit-loss`,
      productsSpentByCompany: () => `${x}/products-spent-by-company`,
      index: () => `${x}`,
      counters: () => `${x}/counters`,
      dashboardOverview: () => `${x}/dashboard-overview`,
      byMonths: () => `${x}/by-months`,
    }))(`${b}/analytics`),
    invoices: ((x: string) => ({
      index: () => `${x}`,
      store: () => `${x}`,
      show: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      details: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/details`,
      pdf: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/pdf`,
      createPdf: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/create-pdf`,
      send: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/send`,
      generatePaymentLink: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/generate-payment-link`,
      stripeHostedCheckout: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/stripe-hosted-checkout`,
      stripePaymentLink: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/stripe-payment-link`,
      update: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      destroy: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
    }))(`${b}/invoices`),
    payments: ((x: string) => ({
      index: () => `${x}`,
      store: () => `${x}`,
      refund: () => `${x}/refund`,
      evidence: (paymentId: number | string, fileIndex: number | string) =>
        `${x}/${encodeURIComponent(String(paymentId))}/evidence/${encodeURIComponent(String(fileIndex))}`,
      show: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      status: (paymentIntentId: string) =>
        `${x}/${encodeURIComponent(paymentIntentId)}/status`,
      repay: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/repay`,
      cancel: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/cancel`,
    }))(`${b}/payments`),
    customers: ((x: string) => ({
      index: () => `${x}`,
      store: () => `${x}`,
      show: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      update: (customer: number | string) =>
        `${x}/${encodeURIComponent(String(customer))}`,
      destroy: (customer: number | string) =>
        `${x}/${encodeURIComponent(String(customer))}`,
      productPricingList: (customer: number | string) =>
        `${x}/${encodeURIComponent(String(customer))}/product-pricing-list`,
      productPricing: (customer: number | string) =>
        `${x}/${encodeURIComponent(String(customer))}/product-pricing`,
      bulkUpdateProductPricing: (customer: number | string) =>
        `${x}/${encodeURIComponent(String(customer))}/product-pricing/bulk-update`,
      copyFromCompany: (customer: number | string) =>
        `${x}/${encodeURIComponent(String(customer))}/product-pricing/copy-from-company`,
      deleteProductPricing: (customer: number | string, productId: number | string) =>
        `${x}/${encodeURIComponent(String(customer))}/product-pricing/${encodeURIComponent(String(productId))}`,
    }))(`${b}/customers`),
    expenses: ((x: string) => ({
      index: () => `${x}`,
      store: () => `${x}`,
      update: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      show: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      pdf: (id: number | string) => `${x}/${encodeURIComponent(String(id))}/pdf`,
      createPdf: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/create-pdf`,
      destroy: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      receipt: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/receipt`,
      file: (id: number | string, fileIndex: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/files/${encodeURIComponent(String(fileIndex))}`,
    }))(`${b}/expenses`),
    expenseCategories: ((x: string) => ({
      index: () => `${x}`,
      store: () => `${x}`,
      show: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      update: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      destroy: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      softDelete: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/soft-delete`,
      restore: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/restore`,
    }))(`${b}/expense-categories`),
    products: ((x: string) => ({
      index: () => `${x}`,
      active: () => `${x}/active`,
      withCompanyPricing: () => `${x}/with-company-pricing`,
      withCustomerPricing: () => `${x}/with-customer-pricing`,
      store: () => `${x}`,
      categoriesList: () => `${x}/categories-list`,
      categories: () => `${x}/categories`,
      updateCategory: (id: number | string) =>
        `${x}/categories/${encodeURIComponent(String(id))}`,
      deleteCategory: (id: number | string) =>
        `${x}/categories/${encodeURIComponent(String(id))}`,
      show: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      update: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      post: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      destroy: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      softDelete: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/soft-delete`,
      restore: (id: number | string) =>
        `${x}/${encodeURIComponent(String(id))}/restore`,
      pricing: (productId: number | string, tenantId: number | string) =>
        `${x}/${encodeURIComponent(String(productId))}/pricing/${encodeURIComponent(String(tenantId))}`,
    }))(`${b}/products`),
    productCategories: ((x: string) => ({
      index: () => `${x}`,
      store: () => `${x}`,
      show: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      update: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      destroy: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
    }))(`${b}/product-categories`),
    currencies: ((x: string) => ({
      index: () => `${x}`,
      active: () => `${x}/active`,
      base: () => `${x}/base`,
      code: (code: string) => `${x}/code/${encodeURIComponent(code)}`,
      updateRates: () => `${x}/update-rates`,
      convert: () => `${x}/convert`,
      stats: () => `${x}/stats`,
      recentlyUpdated: () => `${x}/recently-updated`,
      supported: () => `${x}/supported`,
      add: () => `${x}/add`,
      update: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      destroy: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      checkSupport: () => `${x}/check-support`,
    }))(`${b}/currencies`),
    reports: ((x: string) => ({
      profitLoss: () => `${x}/profit-loss`,
      accountsReceivableAging: () => `${x}/accounts-receivable-aging`,
      vatSummary: () => `${x}/vat-summary`,
      customerStatements: () => `${x}/customer-statements`,
      customerStatement: () => `${x}/customer-statement`,
      customerStatementDownload: () => `${x}/customer-statement/download`,
      paymentHistory: () => `${x}/payment-history`,
      arAging: () => `${x}/ar-aging`,
      salesExpense: () => `${x}/sales-expense`,
      profitLossEnhanced: () => `${x}/profit-loss-enhanced`,
      vatSummaryEnhanced: () => `${x}/vat-summary-enhanced`,
      paymentHistoryEnhanced: () => `${x}/payment-history-enhanced`,
      dashboard: () => `${x}/dashboard`,
      export: () => `${x}/export`,
    }))(`${b}/reports`),
    stripe: ((x: string) => ({
      paymentMethodsForCustomer: (crmCompanyId: string) =>
        `${x}/payment-methods/customer/${encodeURIComponent(crmCompanyId)}`,
      createPaymentMethodForCustomer: (crmCompanyId: string) =>
        `${x}/payment-methods/customer/${encodeURIComponent(crmCompanyId)}`,
      createPaymentMethodWithElementsForCustomer: (crmCompanyId: string) =>
        `${x}/create-payment-method/customer/${encodeURIComponent(crmCompanyId)}`,
      createAndConfirmPaymentMethodForCustomer: (crmCompanyId: string) =>
        `${x}/create-and-confirm-payment-method/customer/${encodeURIComponent(crmCompanyId)}`,
      setDefaultForCustomer: (crmCompanyId: string) =>
        `${x}/set-default/customer/${encodeURIComponent(crmCompanyId)}`,
      paymentMethods: (profileId: number | string) =>
        `${x}/payment-methods/${encodeURIComponent(String(profileId))}`,
      createPaymentMethod: (profileId: number | string) =>
        `${x}/payment-methods/${encodeURIComponent(String(profileId))}`,
      updatePaymentMethod: (paymentMethodId: string) =>
        `${x}/payment-methods/${encodeURIComponent(paymentMethodId)}`,
      deletePaymentMethod: (paymentMethodId: string) =>
        `${x}/payment-methods/${encodeURIComponent(paymentMethodId)}`,
      setDefault: (profileId: number | string) =>
        `${x}/set-default/${encodeURIComponent(String(profileId))}`,
      validateCard: () => `${x}/validate-card`,
      testCardValidation: () => `${x}/test-card-validation`,
      savePaymentMethod: () => `${x}/save-payment-method`,
      createPaymentIntent: () => `${x}/create-payment-intent`,
      createPaymentMethodAndIntent: () =>
        `${x}/create-payment-method-and-intent`,
      confirmPaymentIntent: () => `${x}/confirm-payment-intent`,
      incompletePayments: () => `${x}/incomplete-payments`,
      completePayment: () => `${x}/complete-payment`,
      retryPayment: () => `${x}/retry-payment`,
      publishableKey: () => `${x}/publishable-key`,
      latestTransactionFee: () => `${x}/latest-transaction-fee`,
      createPaymentMethodByProfile: (profileId: number | string) =>
        `${x}/create-payment-method/${encodeURIComponent(String(profileId))}`,
      createAndConfirmPaymentMethodByProfile: (profileId: number | string) =>
        `${x}/create-and-confirm-payment-method/${encodeURIComponent(String(profileId))}`,
    }))(`${b}/stripe`),
    inventory: ((x: string) => ({
      index: () => `${x}`,
      create: () => `${x}/create`,
      select: () => `${x}/select`,
      summary: () => `${x}/summary`,
      stats: () => `${x}/stats`,
      search: () => `${x}/search`,
      categories: () => `${x}/categories`,
      category: (category: string) =>
        `${x}/category/${encodeURIComponent(category)}`,
      show: (id: number | string) => `${x}/${encodeURIComponent(String(id))}`,
      locations: ((l: string) => ({
        index: () => `${l}`,
        store: () => `${l}`,
        show: (id: number | string) => `${l}/${encodeURIComponent(String(id))}`,
        update: (id: number | string) => `${l}/${encodeURIComponent(String(id))}`,
        destroy: (id: number | string) => `${l}/${encodeURIComponent(String(id))}`,
        inventory: (id: number | string) =>
          `${l}/${encodeURIComponent(String(id))}/inventory`,
      }))(`${x}/locations`),
      suppliers: ((s: string) => ({
        index: () => `${s}`,
        store: () => `${s}`,
        show: (id: number | string) => `${s}/${encodeURIComponent(String(id))}`,
        update: (id: number | string) => `${s}/${encodeURIComponent(String(id))}`,
        destroy: (id: number | string) => `${s}/${encodeURIComponent(String(id))}`,
        products: (id: number | string) =>
          `${s}/${encodeURIComponent(String(id))}/products`,
      }))(`${x}/suppliers`),
      items: ((p: string) => ({
        all: () => `${p}/all`,
        index: () => `${p}`,
        show: (id: number | string) =>
          `${p}/${encodeURIComponent(String(id))}`,
        store: () => `${p}`,
        update: (id: number | string) =>
          `${p}/${encodeURIComponent(String(id))}`,
        destroy: (id: number | string) =>
          `${p}/${encodeURIComponent(String(id))}`,
        attach: () => `${p}/attach`,
        detach: (inventoryId: number | string, itemId: number | string) =>
          `${p}/${encodeURIComponent(String(inventoryId))}/${encodeURIComponent(String(itemId))}`,
        byInventory: (inventoryId: number | string) =>
          `${p}/inventory/${encodeURIComponent(String(inventoryId))}`,
      }))(`${x}/items`),
    }))(`${b}/inventory`),
    public: {
      invoicePay: (token: string) =>
        `${b}/public/invoice-pay/${encodeURIComponent(token)}`,
      verifyCheckoutSession: () =>
        `${b}/public/payment/verify-checkout-session`,
      cancelCheckout: () => `${b}/public/payment/cancel-checkout`,
      completePayment: (token: string) =>
        `${b}/public/invoice-pay/${encodeURIComponent(token)}/complete-payment`,
    },
    webhook: {
      stripe: () => `${b}/stripe/webhook`,
    },
  };
}

/** Path-only helpers (`/user`, `/invoices`, …) for Axios `baseURL` (`/api/backend`). */
export const apiRoutes = createApiRoutes("");

/** Same factory with an explicit base segment, e.g. `buildApiRouteTree("/api")` for documentation parity. */
export const buildApiRouteTree = createApiRoutes;
