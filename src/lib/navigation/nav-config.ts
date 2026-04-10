import type { AppPath } from "@/lib/navigation/app-paths";
import { appPaths } from "@/lib/navigation/app-paths";

export type NavItem = {
  label: string;
  href: AppPath;
  description?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const navigationGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: appPaths.dashboard },
      { label: "Analytics", href: appPaths.analytics },
    ],
  },
  {
    title: "People & access",
    items: [
      { label: "Users", href: appPaths.users },
      { label: "Ranks", href: appPaths.ranks },
      { label: "Audit logs", href: appPaths.auditLogs },
    ],
  },
  {
    title: "Organizations",
    items: [
      { label: "Company", href: appPaths.company },
      { label: "CRM companies", href: appPaths.crm },
      { label: "Vendors", href: appPaths.vendors },
      { label: "Customers", href: appPaths.customers },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Invoices", href: appPaths.invoices },
      { label: "Payments", href: appPaths.payments },
      { label: "Expenses", href: appPaths.expenses },
      { label: "Expense categories", href: appPaths.expenseCategories },
      { label: "Reports", href: appPaths.reports },
      { label: "Currencies", href: appPaths.currencies },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Products", href: appPaths.products },
      { label: "Product categories", href: appPaths.productCategories },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Inventory", href: appPaths.inventory },
      { label: "Stripe", href: appPaths.stripe },
    ],
  },
];
