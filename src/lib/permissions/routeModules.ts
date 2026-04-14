import type { AppPath } from "@/lib/navigation/appPaths";
import { appPaths } from "@/lib/navigation/appPaths";
import { ModuleName } from "@/models/Module";

/**
 * Maps UI routes to API module keys for `canView` / `hasPermission` checks.
 * Routes omitted here are not gated (e.g. dashboard shell).
 */
export const appPathToModule: Partial<Record<AppPath, ModuleName>> = {
  [appPaths.analytics]: ModuleName.GLOBAL,
  [appPaths.users]: ModuleName.USER,
  [appPaths.company]: ModuleName.COMPANY,
  [appPaths.invoices]: ModuleName.INVOICE,
  [appPaths.payments]: ModuleName.PAYMENT,
  [appPaths.customers]: ModuleName.CUSTOMER,
  [appPaths.expenses]: ModuleName.EXPENSE,
  [appPaths.expenseCategories]: ModuleName.EXPENSE_CATEGORY,
  [appPaths.products]: ModuleName.PRODUCT,
  [appPaths.productCategories]: ModuleName.PRODUCT_CATEGORY,
  [appPaths.currencies]: ModuleName.CURRENCY,
  [appPaths.reports]: ModuleName.GLOBAL,
  [appPaths.statementOfAccount]: ModuleName.GLOBAL,
  [appPaths.vendors]: ModuleName.VENDOR,
  [appPaths.ranks]: ModuleName.RANK,
  [appPaths.crm]: ModuleName.CUSTOMER,
  [appPaths.auditLogs]: ModuleName.AUDIT_LOG,
  [appPaths.inventory]: ModuleName.INVENTORY,
  [appPaths.stripe]: ModuleName.PAYMENT,
};
