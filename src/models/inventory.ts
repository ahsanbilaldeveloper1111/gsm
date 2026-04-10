import type { PaginationParams } from "@/lib/pagination";

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  parent_id?: number;
  created_at: string;
  updated_at: string;
}

/** Product row shape used next to inventory payloads (see also `@/models/product`). */
export interface InventoryProduct {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  is_active: boolean;
  category_id?: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryLocation {
  id: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface InventorySupplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id?: number;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  base_price: number;
  currency?: string;
  cost_price?: number;
  selling_price?: number;
  unit_of_measure?: string;
  weight?: number;
  dimensions?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  warranty_period?: number;
  expiry_date?: string;
  category_id?: number;
  location_id?: number;
  supplier_id?: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  reorder_point?: number;
  reorder_quantity?: number;
  status?: "in_stock" | "low_stock" | "out_of_stock";
  is_active?: boolean;
  is_service?: boolean;
  is_taxable?: boolean;
  tax_rate?: number;
  notes?: string;
  last_updated?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  category?: ProductCategory;
  location?: InventoryLocation;
  supplier?: InventorySupplier;
}

export interface InventoryListResponse {
  data: Inventory[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface InventoryStats {
  total_inventories: number;
  active_inventories: number;
  inactive_inventories: number;
  service_inventories: number;
  product_inventories: number;
}

export interface InventorySummary {
  total_inventories: number;
  total_value: number;
  total_stock: number;
}

export interface IndexInventoryCategoryParams {
  page?: number;
  limit?: number;
  search?: string;
  order?: {
    column: string;
    dir: "asc" | "desc";
  };
  is_active?: boolean;
}

export type IndexInventoryLocationParams = Partial<PaginationParams>;

export interface IndexInventoryParams extends Partial<PaginationParams> {
  category_id?: number;
  is_active?: boolean;
}

export interface CreateInventoryData {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  base_price: number;
  cost_price?: number;
  selling_price?: number;
  unit_of_measure?: string;
  weight?: number;
  dimensions?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  warranty_period?: number;
  expiry_date?: string;
  category_id?: number;
  location_id?: number;
  supplier_id?: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  reorder_point?: number;
  reorder_quantity?: number;
  is_active?: boolean;
  is_service?: boolean;
  is_taxable?: boolean;
  tax_rate?: number;
  notes?: string;
}

export type UpdateInventoryData = Partial<CreateInventoryData>;
