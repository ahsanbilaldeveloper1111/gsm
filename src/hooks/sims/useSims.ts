"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { CreateSimPayload, IndexSimParams, UpdateSimPayload } from "@/models/Sim";
import { simsService } from "@/services/sims.service";

function record(params?: Record<string, unknown> | null): Record<string, unknown> | null {
  return params ?? null;
}

export function useSims(params?: IndexSimParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.sims.list(record(params as Record<string, unknown> | undefined)),
    queryFn: () => simsService.list(params),
    enabled,
  });
}

export function useSimMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.sims.all });

  const create = useMutation({
    mutationFn: (payload: CreateSimPayload) => simsService.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateSimPayload }) =>
      simsService.update(id, payload),
    onSuccess: invalidate,
  });

  const destroy = useMutation({
    mutationFn: (id: number | string) => simsService.destroy(id),
    onSuccess: invalidate,
  });

  return { create, update, destroy };
}
