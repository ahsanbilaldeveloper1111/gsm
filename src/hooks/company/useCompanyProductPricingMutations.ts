"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { companyService } from "@/services/company.service";

export function useCompanyProductPricingMutations(
  companyPathId: string | null | undefined,
) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.company.all });
  };

  const updateProductPricing = useMutation({
    mutationFn: (body: unknown) =>
      companyService.createProductPricing(companyPathId as string, body),
    onSuccess: invalidate,
  });

  const bulkUpdateProductPricing = useMutation({
    mutationFn: (body: unknown) =>
      companyService.bulkUpdateProductPricing(companyPathId as string, body),
    onSuccess: invalidate,
  });

  const deleteProductPricing = useMutation({
    mutationFn: (productId: number | string) =>
      companyService.deleteProductPricing(companyPathId as string, productId),
    onSuccess: invalidate,
  });

  return {
    updateProductPricing,
    bulkUpdateProductPricing,
    deleteProductPricing,
  };
}
