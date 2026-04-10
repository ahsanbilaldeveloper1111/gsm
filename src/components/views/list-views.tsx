"use client";

import { ModelListBody } from "@/components/views/model-list-body";
import { useAuditLogs } from "@/hooks/audit-logs/use-audit-logs";
import { useCompanies } from "@/hooks/company/use-companies";
import { useCrmCompanies } from "@/hooks/crm/use-crm-companies";
import { useCurrencies } from "@/hooks/currencies/use-currencies";
import { useCustomers } from "@/hooks/customers/use-customers";
import { useExpenseCategories } from "@/hooks/expense-categories/use-expense-categories";
import { useExpenses } from "@/hooks/expenses/use-expenses";
import { useInventory } from "@/hooks/inventory/use-inventory";
import { useInvoices } from "@/hooks/invoices/use-invoices";
import { usePayments } from "@/hooks/payments/use-payments";
import { useProductCategories } from "@/hooks/product-categories/use-product-categories";
import { useProducts } from "@/hooks/products/use-products";
import { useRanks } from "@/hooks/ranks/use-ranks";
import { useReportsDashboard } from "@/hooks/reports/use-reports-dashboard";
import { useStripePublishableKey } from "@/hooks/stripe/use-stripe-publishable-key";
import { useUsers } from "@/hooks/users/use-users";
import { useVendors } from "@/hooks/vendors/use-vendors";

export function UsersView() {
  const q = useUsers();
  return <ModelListBody query={q} title="Users" />;
}

export function CompanyView() {
  const q = useCompanies();
  return <ModelListBody query={q} title="Companies" />;
}

export function InvoicesView() {
  const q = useInvoices();
  return <ModelListBody query={q} title="Invoices" />;
}

export function PaymentsView() {
  const q = usePayments();
  return <ModelListBody query={q} title="Payments" />;
}

export function CustomersView() {
  const q = useCustomers();
  return <ModelListBody query={q} title="Customers" />;
}

export function ExpensesView() {
  const q = useExpenses();
  return <ModelListBody query={q} title="Expenses" />;
}

export function ExpenseCategoriesView() {
  const q = useExpenseCategories();
  return <ModelListBody query={q} title="Expense categories" />;
}

export function ProductsView() {
  const q = useProducts();
  return <ModelListBody query={q} title="Products" />;
}

export function ProductCategoriesView() {
  const q = useProductCategories();
  return <ModelListBody query={q} title="Product categories" />;
}

export function CurrenciesView() {
  const q = useCurrencies();
  return <ModelListBody query={q} title="Currencies" />;
}

export function ReportsView() {
  const q = useReportsDashboard();
  return <ModelListBody query={q} title="Reports dashboard" />;
}

export function VendorsView() {
  const q = useVendors();
  return <ModelListBody query={q} title="Vendors" />;
}

export function RanksView() {
  const q = useRanks();
  return <ModelListBody query={q} title="Ranks" />;
}

export function CrmView() {
  const q = useCrmCompanies();
  return <ModelListBody query={q} title="CRM companies" />;
}

export function AuditLogsView() {
  const q = useAuditLogs();
  return <ModelListBody query={q} title="Audit logs" />;
}

export function InventoryView() {
  const q = useInventory();
  return <ModelListBody query={q} title="Inventory" />;
}

export function StripeView() {
  const q = useStripePublishableKey();
  return <ModelListBody query={q} title="Stripe" />;
}
