import type { ApiSuccessResponse } from "@/lib/api/types";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  type QueryParams,
} from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/api-routes";
import type {
  CreateInventoryData,
  IndexInventoryParams,
  Inventory,
  InventoryStats,
  InventorySummary,
} from "@/models/inventory";

const r = apiRoutes.inventory;

export const inventoryService = {
  list: (params?: IndexInventoryParams) =>
    apiGet<ApiSuccessResponse<Inventory[]>>(
      r.index(),
      params as QueryParams | undefined,
    ),

  create: (body: CreateInventoryData) =>
    apiPost<ApiSuccessResponse<Inventory>>(r.create(), body),

  select: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.select(), params),

  summary: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<InventorySummary>>(r.summary(), params),

  stats: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<InventoryStats>>(r.stats(), params),

  search: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Inventory[]>>(r.search(), params),

  categories: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.categories(), params),

  byCategory: (category: string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Inventory[]>>(r.category(category), params),

  show: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<Inventory>>(r.show(id), params),

  locations: {
    list: (params?: QueryParams) =>
      apiGet<ApiSuccessResponse<unknown>>(r.locations.index(), params),

    create: (body: unknown) =>
      apiPost<ApiSuccessResponse<unknown>>(r.locations.store(), body),

    show: (id: number | string, params?: QueryParams) =>
      apiGet<ApiSuccessResponse<unknown>>(r.locations.show(id), params),

    update: (id: number | string, body: unknown) =>
      apiPut<ApiSuccessResponse<unknown>>(r.locations.update(id), body),

    destroy: (id: number | string) =>
      apiDelete<ApiSuccessResponse<unknown>>(r.locations.destroy(id)),

    inventory: (id: number | string, params?: QueryParams) =>
      apiGet<ApiSuccessResponse<unknown>>(r.locations.inventory(id), params),
  },

  suppliers: {
    list: (params?: QueryParams) =>
      apiGet<ApiSuccessResponse<unknown>>(r.suppliers.index(), params),

    create: (body: unknown) =>
      apiPost<ApiSuccessResponse<unknown>>(r.suppliers.store(), body),

    show: (id: number | string, params?: QueryParams) =>
      apiGet<ApiSuccessResponse<unknown>>(r.suppliers.show(id), params),

    update: (id: number | string, body: unknown) =>
      apiPut<ApiSuccessResponse<unknown>>(r.suppliers.update(id), body),

    destroy: (id: number | string) =>
      apiDelete<ApiSuccessResponse<unknown>>(r.suppliers.destroy(id)),

    products: (id: number | string, params?: QueryParams) =>
      apiGet<ApiSuccessResponse<unknown>>(r.suppliers.products(id), params),
  },

  items: {
    all: (params?: QueryParams) =>
      apiGet<ApiSuccessResponse<unknown>>(r.items.all(), params),

    list: (params?: QueryParams) =>
      apiGet<ApiSuccessResponse<unknown>>(r.items.index(), params),

    show: (id: number | string, params?: QueryParams) =>
      apiGet<ApiSuccessResponse<unknown>>(r.items.show(id), params),

    create: (body: unknown) =>
      apiPost<ApiSuccessResponse<unknown>>(r.items.store(), body),

    update: (id: number | string, body: unknown) =>
      apiPut<ApiSuccessResponse<unknown>>(r.items.update(id), body),

    destroy: (id: number | string) =>
      apiDelete<ApiSuccessResponse<unknown>>(r.items.destroy(id)),

    attach: (body: unknown) =>
      apiPost<ApiSuccessResponse<unknown>>(r.items.attach(), body),

    detach: (inventoryId: number | string, itemId: number | string) =>
      apiDelete<ApiSuccessResponse<unknown>>(
        r.items.detach(inventoryId, itemId),
      ),

    byInventory: (inventoryId: number | string, params?: QueryParams) =>
      apiGet<ApiSuccessResponse<unknown>>(
        r.items.byInventory(inventoryId),
        params,
      ),
  },
};
