"use client";

import { useQuery } from "@tanstack/react-query";
import { ResourceListBody } from "@/components/pages/resource-list-body";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import { fetchAuditLogs } from "@/services/audit-logs.service";
import { companyService } from "@/services/company.service";
import { crmService } from "@/services/crm.service";
import { currencyService } from "@/services/currencies.service";
import { customerService } from "@/services/customers.service";
import { expenseCategoryService } from "@/services/expense-categories.service";
import { expenseService } from "@/services/expenses.service";
import { invoiceService } from "@/services/invoices.service";
import { inventoryService } from "@/services/inventory.service";
import { paymentService } from "@/services/payments.service";
import { productCategoryService } from "@/services/product-categories.service";
import { productService } from "@/services/products.service";
import { rankService } from "@/services/ranks.service";
import { reportService } from "@/services/reports.service";
import { stripeService } from "@/services/stripe.service";
import { fetchUsers } from "@/services/users.service";
import { vendorService } from "@/services/vendors.service";

export function UsersView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.users.list(null),
    queryFn: () => fetchUsers(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function CompanyView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.company.list(null),
    queryFn: () => companyService.list(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function InvoicesView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.invoices.list(null),
    queryFn: () => invoiceService.list(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function PaymentsView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.payments.list(null),
    queryFn: () => paymentService.list(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function CustomersView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.customers.list(null),
    queryFn: () => customerService.list(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function ExpensesView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.expenses.list(null),
    queryFn: () => expenseService.list(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function ExpenseCategoriesView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.expenseCategories.list(null),
    queryFn: () => expenseCategoryService.list(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function ProductsView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.products.list(null),
    queryFn: () => productService.list(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function ProductCategoriesView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.productCategories.list(null),
    queryFn: () => productCategoryService.list(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function CurrenciesView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.currencies.index(null),
    queryFn: () => currencyService.list(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function ReportsView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.reports.dashboard(),
    queryFn: () => reportService.dashboard(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function VendorsView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.vendors.list(null),
    queryFn: () => vendorService.list(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function RanksView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.ranks.list(null),
    queryFn: () => rankService.list(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function CrmView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.crm.companies(null),
    queryFn: () => crmService.companies(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function AuditLogsView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.auditLogs.list(null),
    queryFn: () => fetchAuditLogs(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function InventoryView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.inventory.list(null),
    queryFn: () => inventoryService.list(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}

export function StripeView() {
  const enabled = useAuthQueryEnabled();
  const q = useQuery({
    queryKey: queryKeys.stripe.publishableKey(),
    queryFn: () => stripeService.publishableKey(),
    enabled,
  });
  return <ResourceListBody query={q} />;
}
