"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexUssdParams } from "@/models/Ussd";
import { ussdService } from "@/services/ussd.service";

function record(params?: Record<string, unknown> | null): Record<string, unknown> | null {
  return params ?? null;
}

export function useUssd(params?: IndexUssdParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.ussd.list(record(params as Record<string, unknown> | undefined)),
    queryFn: () => ussdService.list(params),
    enabled,
  });
}
