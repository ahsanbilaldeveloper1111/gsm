/**
 * Company fields often returned with product-pricing payloads (subset of full `Company` in `@/models/Company`).
 */
export interface CompanyBasic {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  category?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductCompanyPricingData {
  company_id: number;
  product_id: number;
  selling_price: number;
  company_price: number;
  discount_percentage?: number;
  is_active?: boolean;
}

export interface UpdateProductCompanyPricingData {
  company_price?: number;
  discount_percentage?: number;
  is_active?: boolean;
}
