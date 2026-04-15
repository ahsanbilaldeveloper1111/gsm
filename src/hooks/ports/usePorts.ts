"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexPortParams } from "@/models/Port";
import { portsService } from "@/services/ports.service";

function record(params?: Record<string, unknown> | null): Record<string, unknown> | null {
  return params ?? null;
}

export function usePorts(params?: IndexPortParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.ports.list(record(params as Record<string, unknown> | undefined)),
    queryFn: () => portsService.list(params),
    enabled,
  });
}

export function usePortsByGsm(gsmId: number | string | null | undefined) {
  const enabled = useAuthQueryEnabled() && gsmId != null && gsmId !== "";
  return useQuery({
    queryKey: queryKeys.ports.byGsm(gsmId ?? null),
    queryFn: () => portsService.byGsm(gsmId as number | string),
    enabled,
  });
}
