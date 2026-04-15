import type { LoginPayload } from "@/services/auth.service";
import type { CreateCustomerData } from "@/models/Customer";
import type { CreateCurrencyData, UpdateCurrencyData } from "@/models/Currency";
import type { CreateInventoryData } from "@/models/Inventory";
import type {
  CreatePaymentData,
  CreateRefundData,
  UpdatePaymentData,
} from "@/models/Payment";
import type {
  CreateExpenseData,
  UpdateExpenseData,
} from "@/models/Expense";
import type {
  CreateProductCompanyPricingData,
  UpdateProductCompanyPricingData,
} from "@/models/Product";
import { PermissionAction, type PermissionCreateData } from "@/models/Permission";

/** Initial login form state (matches `LoginPayload` / auth API). */
export function loginFormDefaults(): LoginPayload {
  return { email: "", password: "" };
}

/** Empty create-customer payload; fill before submit. */
export function createCustomerFormDefaults(): CreateCustomerData {
  return {
    name: "",
    email: "",
    phone: "",
    tenant_id: null,
    crm_company_id: null,
    profile: undefined,
  };
}

export function createCurrencyFormDefaults(): CreateCurrencyData {
  return {
    code: "",
    name: "",
    symbol: "",
    exchange_rate: 1,
    is_active: true,
  };
}

export function updateCurrencyFormDefaults(): UpdateCurrencyData {
  return {};
}

export function createInventoryFormDefaults(): CreateInventoryData {
  return {
    name: "",
    base_price: 0,
    current_stock: 0,
    minimum_stock: 0,
  };
}

export function createPaymentFormDefaults(): CreatePaymentData {
  return {
    invoice_id: 0,
    amount: 0,
    payment_method: "cash",
  };
}

export function createRefundFormDefaults(): CreateRefundData {
  return {
    payment_id: 0,
    amount: 0,
  };
}

export function updatePaymentFormDefaults(): UpdatePaymentData {
  return {};
}

export function createProductCompanyPricingFormDefaults(): CreateProductCompanyPricingData {
  return {
    company_id: 0,
    product_id: 0,
    selling_price: 0,
    company_price: 0,
  };
}

export function updateProductCompanyPricingFormDefaults(): UpdateProductCompanyPricingData {
  return {};
}

/** Set `module_id` to a real module id before submit. */
export function createPermissionFormDefaults(): PermissionCreateData {
  return {
    action: PermissionAction.VIEW,
    module_id: 0,
  };
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createExpenseFormDefaults(): CreateExpenseData {
  return {
    expense_date: todayIsoDate(),
    description: "",
    amount: 0,
  };
}

export function updateExpenseFormDefaults(): UpdateExpenseData {
  return {};
}
