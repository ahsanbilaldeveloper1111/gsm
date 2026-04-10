"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/query-keys";
import type { IndexInventoryParams } from "@/models/inventory";
import { inventoryService } from "@/services/inventory.service";

function record(
  p?: IndexInventoryParams | Record<string, unknown> | null,
): Record<string, unknown> | null {
  return (p as Record<string, unknown> | undefined) ?? null;
}

export function useInventorySummary(params?: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.inventory.summary(record(params)),
    queryFn: () => inventoryService.summary(params),
    enabled,
  });
}

export function useInventoryStats(params?: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.inventory.stats(record(params)),
    queryFn: () => inventoryService.stats(params),
    enabled,
  });
}

export function useInventoryDetail(
  id: number | string | null | undefined,
  params?: QueryParams,
) {
  const enabled =
    useAuthQueryEnabled() && id != null && id !== "";
  return useQuery({
    queryKey: queryKeys.inventory.detail(id ?? null),
    queryFn: () => inventoryService.show(id as number | string, params),
    enabled,
  });
}

export function useInventoryLocations(params?: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.inventory.locations.all(), "list", record(params)],
    queryFn: () => inventoryService.locations.list(params),
    enabled,
  });
}

export function useInventorySuppliers(params?: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.inventory.suppliers.all(), "list", record(params)],
    queryFn: () => inventoryService.suppliers.list(params),
    enabled,
  });
}

export function useInventoryItemsList(params?: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.inventory.items.all(), "list", record(params)],
    queryFn: () => inventoryService.items.list(params),
    enabled,
  });
}
