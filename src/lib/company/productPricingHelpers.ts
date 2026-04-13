import type { ProductCompanyPricing } from "@/models/Company";
import type { CompanyBasic, Product } from "@/models/Product";

export type ProductPricingRow = {
  id?: number;
  product_id: number;
  product_name: string;
  product_description?: string;
  custom_description?: string;
  selling_price: number;
  is_active: boolean;
  category?: string;
  discount_applicability?: ProductCompanyPricing["discount_applicability"] | null;
  discount_applicability_id?: number | null;
  base_price: number;
  currency?: string;
  renewal_start_date?: string;
  renewal_end_date?: string;
  status?: string;
  billing_cycle?: string;
  subscriptions?: number;
};

function normalizeDateForInput(value?: string | null): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

function normalizeBillingCycle(value?: string | null): string {
  if (!value) return "one time";
  const normalized = value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");
  if (normalized === "one time" || normalized === "one  time") return "one time";
  return normalized;
}

export function normalizeProductPricingRows(
  raw: unknown,
  companyDefaultCurrency: string,
): ProductPricingRow[] {
  let list: unknown[] = [];
  if (Array.isArray(raw)) list = raw;
  else if (raw && typeof raw === "object" && "data" in raw) {
    const d = (raw as { data: unknown }).data;
    if (Array.isArray(d)) list = d;
    else if (
      d &&
      typeof d === "object" &&
      "data" in d &&
      Array.isArray((d as { data: unknown }).data)
    ) {
      list = (d as { data: unknown[] }).data;
    }
  }
  if (!Array.isArray(list)) return [];

  return (list as (ProductCompanyPricing & { custom_description?: string })[]).map(
    (product) => {
    const p = product.product as Product | undefined;
    const co = (product.company ?? product.customer) as
      | (CompanyBasic & { profile?: { currency?: string } })
      | undefined;
    return {
      id: product.id,
      product_id: product.product_id,
      product_name: p?.name ?? "Unknown product",
      product_description: p?.description ?? "",
      custom_description: product.custom_description ?? "",
      base_price: p?.base_price ?? 0,
      selling_price: product.selling_price ?? 0,
      is_active: product.is_active !== false,
      category:
        typeof p?.category === "string"
          ? p.category
          : p?.category &&
              typeof p.category === "object" &&
              p.category !== null &&
              "name" in p.category
            ? String(
                (p.category as { name?: string }).name ?? "Uncategorized",
              )
            : "Uncategorized",
      currency:
        co?.profile?.currency ?? co?.currency ?? companyDefaultCurrency,
      renewal_start_date: normalizeDateForInput(product.renewal_start_date),
      renewal_end_date: normalizeDateForInput(product.renewal_end_date),
      status: product.status ?? "Active",
      billing_cycle: normalizeBillingCycle(product.billing_cycle),
      subscriptions: product.subscriptions ?? 0,
      discount_applicability: product.discount_applicability ?? undefined,
      discount_applicability_id:
        product.discount_applicability_id ??
        product.discount_applicability?.id ??
        null,
    };
  },
  );
}

/** Renewal window sanity check vs billing cycle (aligned with legacy CRM logic). */
export function validateRenewalDates(
  billingCycle: string | undefined,
  renewalStartDate: string | undefined,
  renewalEndDate: string | undefined,
): string | null {
  if (
    !billingCycle ||
    billingCycle === "one time" ||
    !renewalStartDate ||
    !renewalEndDate
  ) {
    return null;
  }
  const start = new Date(renewalStartDate);
  const end = new Date(renewalEndDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const daysDiff = Math.round((end.getTime() - start.getTime()) / 86400000);
  const monthsDiff =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  const billingCycleLower = billingCycle.toLowerCase();
  let isValid = false;
  let expectedRange = "";

  switch (billingCycleLower) {
    case "monthly":
      isValid =
        (daysDiff >= 28 && daysDiff <= 31) || Math.abs(monthsDiff - 1) < 0.1;
      expectedRange = "28–31 days or ~1 month";
      break;
    case "quarterly":
      isValid =
        (daysDiff >= 85 && daysDiff <= 95) || (monthsDiff >= 2 && monthsDiff <= 4);
      expectedRange = "85–95 days or 2–4 months";
      break;
    case "yearly":
      isValid =
        (daysDiff >= 360 && daysDiff <= 370) || (monthsDiff >= 11 && monthsDiff <= 13);
      expectedRange = "360–370 days or ~12 months";
      break;
    default:
      return null;
  }

  if (!isValid) {
    return `Renewal dates do not match billing cycle “${billingCycle}”. Expected ${expectedRange}; got ${daysDiff} days (~${monthsDiff} months).`;
  }
  return null;
}

export function formatPricingDateShort(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
