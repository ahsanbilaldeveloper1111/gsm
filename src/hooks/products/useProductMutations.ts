"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { productService } from "@/services/products.service";

export function useProductMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: queryKeys.products.all });

  const create = useMutation({
    mutationFn: (body: unknown) => productService.create(body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number | string;
      body: unknown;
    }) => productService.update(id, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number | string) => productService.destroy(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
