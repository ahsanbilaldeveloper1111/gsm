"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexOutboxParams } from "@/models/Outbox";
import { outboxService } from "@/services/outbox.service";

function record(params?: Record<string, unknown> | null): Record<string, unknown> | null {
  return params ?? null;
}

export function useOutbox(params?: IndexOutboxParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.outbox.list(record(params as Record<string, unknown> | undefined)),
    queryFn: () => outboxService.list(params),
    enabled,
  });
}
