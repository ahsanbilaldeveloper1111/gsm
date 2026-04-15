"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexInboxParams } from "@/models/Inbox";
import { inboxService } from "@/services/inbox.service";

function record(params?: Record<string, unknown> | null): Record<string, unknown> | null {
  return params ?? null;
}

export function useInbox(params?: IndexInboxParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.inbox.list(record(params as Record<string, unknown> | undefined)),
    queryFn: () => inboxService.list(params),
    enabled,
  });
}
