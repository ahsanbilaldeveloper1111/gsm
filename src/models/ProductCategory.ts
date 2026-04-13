/**
 * `GET/POST /api/backend/product-categories` — list rows and form payloads.
 */
export interface ProductCategory {
  id: number;
  name: string;
  description?: string | null;
  is_active?: boolean;
  parent_id?: number | null;
  parent?: { id?: number; name?: string } | null;
  created_at?: string;
  updated_at?: string;
}

/** `GET /api/backend/product-categories` — filters + `order[column]` / `order[dir]`. */
export interface IndexProductCategoryParams {
  page?: number;
  limit?: number;
  search?: string;
  "order[column]"?: string;
  "order[dir]"?: "asc" | "desc";
}
