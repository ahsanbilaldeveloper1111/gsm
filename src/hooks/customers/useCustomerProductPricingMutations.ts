"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { customerService } from "@/services/customers.service";

export function useCustomerProductPricingMutations(
  customerPathId: string | null | undefined,
) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.customers.all });
  };

  const updateProductPricing = useMutation({
    mutationFn: (body: unknown) =>
      customerService.createProductPricing(customerPathId as string, body),
    onSuccess: invalidate,
  });

  const bulkUpdateProductPricing = useMutation({
    mutationFn: (body: unknown) =>
      customerService.bulkUpdateProductPricing(customerPathId as string, body),
    onSuccess: invalidate,
  });

  const deleteProductPricing = useMutation({
    mutationFn: (productId: number | string) =>
      customerService.deleteProductPricing(customerPathId as string, productId),
    onSuccess: invalidate,
  });

  return {
    updateProductPricing,
    bulkUpdateProductPricing,
    deleteProductPricing,
  };
}
