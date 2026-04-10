export enum ModuleName {
  CURRENCY = "currency",
  CUSTOMER = "customer",
  USER = "user",
  VENDOR = "vendor",
  USER_SETTING = "user_setting",
  INVENTORY = "inventory",
  GLOBAL = "global",
  AUDIT_LOG = "audit_log",
  RESELLER = "reseller",
  COMPANY = "company",
  PRODUCT = "product",
  PRODUCT_CATEGORY = "product_category",
  INVOICE = "invoice",
  PAYMENT = "payment",
  DISCOUNT = "discount",
  EXPENSE = "expense",
  EXPENSE_CATEGORY = "expense_category",
  INVENTORY_LOCATION = "inventory_location",
  INVENTORY_SUPPLIER = "inventory_supplier",
  RANK = "rank",
}

export enum ModuleStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

/** Module list/detail from API — `permissions` resolved via `./Permission` without a runtime import cycle. */
export interface Module {
  id?: number;
  name: string;
  description?: string;
  permissions?: import("./Permission").Permission[];
  created_at?: string;
  updated_at?: string;
}
