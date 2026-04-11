"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { vendorService } from "@/services/vendors.service";

export function useVendorMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: queryKeys.vendors.all });

  const create = useMutation({
    mutationFn: (body: unknown) => vendorService.create(body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number | string;
      body: unknown;
    }) => vendorService.update(id, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number | string) => vendorService.destroy(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
