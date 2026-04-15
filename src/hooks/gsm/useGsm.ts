"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexGsmParams } from "@/models/Gsm";
import { gsmService } from "@/services/gsm.service";

function record(params?: Record<string, unknown> | null): Record<string, unknown> | null {
  return params ?? null;
}

export function useGsm(params?: IndexGsmParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.gsm.list(record(params as Record<string, unknown> | undefined)),
    queryFn: () => gsmService.list(params),
    enabled,
  });
}

export function useGsmClientProfile(params?: Record<string, unknown>) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.gsm.clientProfile(record(params)),
    queryFn: () => gsmService.clientProfile(params),
    enabled,
  });
}
