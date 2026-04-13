import type { ProductFormState } from "@/lib/products/productFormState";

export function validateProductForm(
  f: ProductFormState,
  isEdit: boolean,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!f.name.trim()) {
    errors.name = "Product name is required";
  }
  const cat =
    f.category_id === "" || f.category_id === undefined
      ? null
      : Number(f.category_id);
  if (isEdit && (!cat || cat <= 0)) {
    errors.category_id = "Category is required";
  }
  const base = Number.parseFloat(String(f.base_price).trim() || "0");
  if (!base || base <= 0) {
    errors.base_price = "Base price must be greater than 0";
  }
  return errors;
}

export function hasValidationErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}
