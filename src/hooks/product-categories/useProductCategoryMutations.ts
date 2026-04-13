"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { productCategoryService } from "@/services/product-categories.service";

export function useProductCategoryMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.productCategories.all });
    void qc.invalidateQueries({ queryKey: queryKeys.products.all });
  };

  const create = useMutation({
    mutationFn: (body: unknown) => productCategoryService.create(body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number | string;
      body: unknown;
    }) => productCategoryService.update(id, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number | string) => productCategoryService.destroy(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
