/**
 * Product domain — URL state, form state, validation, and view helpers.
 * UI lives under `@/components/products` and `@/components/views/ProductCrudView`.
 */
export {
  buildProductListSearchParams,
  defaultProductListUrlState,
  parseProductListSearchParams,
  type ProductListUrlState,
} from "@/lib/products/productListUrl";

export {
  buildProductMutationPayload,
  defaultProductFormState,
  productFormStateFromApiProduct,
  type ProductFormState,
} from "@/lib/products/productFormState";

export {
  hasValidationErrors,
  validateProductForm,
} from "@/lib/products/productFormValidation";

export {
  formatProductDetailDateTime,
  formatProductDetailShortDate,
  pickProductShowDiscounts,
  pickProductShowPricings,
  productCategoryLine,
  productPricingCompanyCell,
} from "@/lib/products/viewProductDisplay";
