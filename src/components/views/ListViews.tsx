"use client";

import { ModelListBody } from "@/components/views/ModelListBody";
import { useAuditLogs } from "@/hooks/audit-logs/useAuditLogs";
import { useCompanies } from "@/hooks/company/useCompanies";
import { useCrmCompanies } from "@/hooks/crm/useCrmCompanies";
import { useCurrencies } from "@/hooks/currencies/useCurrencies";
import { useCustomers } from "@/hooks/customers/useCustomers";
import { useExpenseCategories } from "@/hooks/expense-categories/useExpenseCategories";
import { useExpenses } from "@/hooks/expenses/useExpenses";
import { useInventory } from "@/hooks/inventory/useInventory";
import { useInvoices } from "@/hooks/invoices/useInvoices";
import { usePayments } from "@/hooks/payments/usePayments";
import { useProductCategories } from "@/hooks/product-categories/useProductCategories";
import { useProducts } from "@/hooks/products/useProducts";
import { useReportsDashboard } from "@/hooks/reports/useReportsDashboard";
import { useStripePublishableKey } from "@/hooks/stripe/useStripePublishableKey";
import { useUsers } from "@/hooks/users/useUsers";
import { useVendors } from "@/hooks/vendors/useVendors";

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

export function CrmView() {
  const q = useCrmCompanies();
  return (
    <ModelListBody
      query={q}
      title="CRM companies"
      viewable
      detailModalTitle="CRM company"
      detailModalSubtitle="CRM company row from the list response (read-only proxy)."
    />
  );
}

export function AuditLogsView() {
  const q = useAuditLogs();
  return (
    <ModelListBody
      query={q}
      title="Audit logs"
      viewable
      detailModalTitle="Audit log"
      detailModalSubtitle="Full row from the audit log list (immutable activity record)."
    />
  );
}

export function InventoryView() {
  const q = useInventory();
  return <ModelListBody query={q} title="Inventory" />;
}

export function StripeView() {
  const q = useStripePublishableKey();
  return <ModelListBody query={q} title="Stripe" />;
}
