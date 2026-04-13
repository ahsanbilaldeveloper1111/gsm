import { asArray } from "@/lib/dashboard/unwrapAnalyticsPayload";
import type {
  Product,
  ProductCategoryRef,
  ProductShowDiscountApplicabilityRow,
  ProductShowPricingRow,
} from "@/models/Product";

export function formatProductDetailShortDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatProductDetailDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function productCategoryLine(p: Product & Record<string, unknown>): string {
  const c = p.category;
  if (c == null) return "N/A";
  if (typeof c === "string") return c.trim() ? c : "N/A";
  if (typeof c === "object" && c !== null && "name" in c) {
    return (c as ProductCategoryRef).name?.trim() || "N/A";
  }
  return "N/A";
}

/** Legacy: `crm_company_id ?? company.name ?? 'N/A'`. */
export function productPricingCompanyCell(row: ProductShowPricingRow): string {
  const co = row.company;
  if (!co || typeof co !== "object") return "N/A";
  const id = co.crm_company_id;
  if (id != null && String(id).trim()) return String(id);
  const name =
    typeof co.name === "string" && co.name.trim() ? co.name.trim() : "";
  if (name) return name;
  return "N/A";
}

export function pickProductShowPricings(
  p: Product & Record<string, unknown>,
): ProductShowPricingRow[] {
  const raw = p.productPricings ?? p.product_pricings;
  return asArray<ProductShowPricingRow>(raw);
}

export function pickProductShowDiscounts(
  p: Product & Record<string, unknown>,
): ProductShowDiscountApplicabilityRow[] {
  const raw = p.discountApplicability ?? p.discount_applicability;
  return asArray<ProductShowDiscountApplicabilityRow>(raw);
}
