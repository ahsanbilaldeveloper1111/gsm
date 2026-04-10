"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import type { QueryParams } from "@/lib/api/http";
import { rankService } from "@/services/ranks.service";

export function useRanks(params?: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.ranks.list(params ?? null),
    queryFn: () => rankService.list(params),
    enabled,
  });
}
