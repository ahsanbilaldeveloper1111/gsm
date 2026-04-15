"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexCdrParams } from "@/models/Cdr";
import { cdrService } from "@/services/cdr.service";

function record(params?: Record<string, unknown> | null): Record<string, unknown> | null {
  return params ?? null;
}

export function useCdr(params?: IndexCdrParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.cdr.list(record(params as Record<string, unknown> | undefined)),
    queryFn: () => cdrService.list(params),
    enabled,
  });
}
