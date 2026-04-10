"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import type { IndexInventoryParams } from "@/models/inventory";
import { inventoryService } from "@/services/inventory.service";

export function useInventory(params?: IndexInventoryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.inventory.list(
      (params as Record<string, unknown> | undefined) ?? null,
    ),
    queryFn: () => inventoryService.list(params),
    enabled,
  });
}
