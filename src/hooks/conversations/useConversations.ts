"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexConversationParams } from "@/models/Conversation";
import { conversationsService } from "@/services/conversations.service";

function record(params?: Record<string, unknown> | null): Record<string, unknown> | null {
  return params ?? null;
}

export function useConversations(params?: IndexConversationParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.conversations.list(
      record(params as Record<string, unknown> | undefined),
    ),
    queryFn: () => conversationsService.list(params),
    enabled,
  });
}

export function useConversationStatistics() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.conversations.statistics(),
    queryFn: () => conversationsService.statistics(),
    enabled,
  });
}
