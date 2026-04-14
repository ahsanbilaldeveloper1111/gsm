import type { Product } from "@/models/Product";

export type ProductFormState = {
  name: string;
  sku: string;
  description: string;
  base_price: string;
  category_id: string | number;
  is_service: boolean;
  is_active: boolean;
  currency: string;
  tenant_id: string;
};

export function defaultProductFormState(): ProductFormState {
  return {
    name: "",
    sku: "",
    description: "",
    base_price: "",
    category_id: "",
    is_service: false,
    is_active: true,
    currency: "USD",
    tenant_id: "",
  };
}

export function productFormStateFromApiProduct(
  raw: Product & Record<string, unknown>,
): ProductFormState {
  const catId =
    typeof raw.category_id === "number"
      ? raw.category_id
      : typeof (raw as { category?: { id?: number } }).category?.id ===
          "number"
        ? (raw as { category: { id: number } }).category.id
        : "";
  return {
    name: String(raw.name ?? ""),
    sku: raw.sku != null ? String(raw.sku) : "",
    description: raw.description != null ? String(raw.description) : "",
    base_price:
      raw.base_price != null && Number.isFinite(Number(raw.base_price))
        ? String(raw.base_price)
        : "",
    category_id: catId === "" ? "" : catId,
    is_service: Boolean(raw.is_service),
    is_active: raw.is_active !== false,
    currency:
      typeof raw.currency === "string" && raw.currency.trim()
        ? raw.currency
        : "USD",
    tenant_id:
      raw.tenant_id != null ? String(raw.tenant_id).trim() : "",
  };
}

export function buildProductMutationPayload(
  f: ProductFormState,
  _isEdit: boolean,
): Record<string, unknown> {
  const base = Number.parseFloat(String(f.base_price).trim() || "0");
  const categoryId =
    f.category_id === "" || f.category_id === undefined
      ? null
      : Number(f.category_id);
  const body: Record<string, unknown> = {
    name: f.name.trim(),
    ...(f.sku.trim() ? { sku: f.sku.trim() } : {}),
    ...(f.description.trim() ? { description: f.description.trim() } : {}),
    base_price: base,
    ...(categoryId != null ? { category_id: categoryId } : {}),
    is_service: f.is_service,
    is_active: f.is_active,
    currency: f.currency.trim() || "USD",
  };
  body.tenant_id =
    typeof f.tenant_id === "string" && f.tenant_id.trim()
      ? f.tenant_id.trim()
      : null;
  return body;
}
