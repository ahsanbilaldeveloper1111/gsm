"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexGsmAssignmentParams } from "@/models/GsmAssignment";
import { gsmAssignmentsService } from "@/services/gsm-assignments.service";

function record(params?: Record<string, unknown> | null): Record<string, unknown> | null {
  return params ?? null;
}

export function useGsmAssignments(params?: IndexGsmAssignmentParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.gsmAssignments.list(
      record(params as Record<string, unknown> | undefined),
    ),
    queryFn: () => gsmAssignmentsService.list(params),
    enabled,
  });
}

export function useGsmAssignmentsMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.gsmAssignments.all });

  const create = useMutation({
    mutationFn: (payload: { gsm_id: number | string; company_id: number | string }) =>
      gsmAssignmentsService.create(payload.gsm_id, payload.company_id),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: (payload: {
      id: number | string;
      gsm_id: number | string;
      company_id: number | string;
      status: string;
    }) =>
      gsmAssignmentsService.update(payload.id, {
        gsm_id: payload.gsm_id,
        company_id: payload.company_id,
        status: payload.status,
      }),
    onSuccess: invalidate,
  });
  const destroy = useMutation({
    mutationFn: (id: number | string) => gsmAssignmentsService.destroy(id),
    onSuccess: invalidate,
  });

  return { create, update, destroy };
}
