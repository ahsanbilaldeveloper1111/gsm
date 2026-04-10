"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/query-keys";
import { tokenPublicService } from "@/services/token-public.service";

function keyPart(p?: QueryParams): Record<string, unknown> | null {
  return (p as Record<string, unknown> | undefined) ?? null;
}

/** Unauthenticated GET token — opt-in with `enabled` (default false). */
export function useTokenPublicGet(
  params?: QueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.tokenPublic.get(keyPart(params)),
    queryFn: () => tokenPublicService.getTokenGet(params),
    enabled: options?.enabled ?? false,
  });
}

export function useTokenPublicPostMutation() {
  return useMutation({
    mutationFn: (body: unknown) => tokenPublicService.getTokenPost(body),
  });
}

export function useTokenPublicRefreshMutation() {
  return useMutation({
    mutationFn: (body?: unknown) =>
      tokenPublicService.refreshTokenPost(body),
  });
}
