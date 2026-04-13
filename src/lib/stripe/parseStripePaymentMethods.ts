import { unwrapApiSuccessData } from "@/lib/dashboard/unwrapAnalyticsPayload";

export type StripePaymentMethodRow = {
  id: string;
  card?: {
    brand?: string;
    last4?: string;
    exp_month?: number;
    exp_year?: number;
  };
  is_default?: boolean;
};

/**
 * Normalizes Stripe payment-method list payloads from GET …/stripe/payment-methods/…
 */
export function parseStripePaymentMethods(data: unknown): StripePaymentMethodRow[] {
  const o = unwrapApiSuccessData<unknown>(data);
  let list: unknown = o;
  if (list && typeof list === "object" && "payment_methods" in list) {
    list = (list as { payment_methods: unknown }).payment_methods;
  }
  if (
    list &&
    typeof list === "object" &&
    !Array.isArray(list) &&
    "data" in (list as object)
  ) {
    const inner = (list as { data: unknown }).data;
    if (Array.isArray(inner)) list = inner;
  }
  if (!Array.isArray(list)) return [];
  return list.filter(
    (x): x is StripePaymentMethodRow =>
      x != null && typeof x === "object" && "id" in (x as object),
  ) as StripePaymentMethodRow[];
}
