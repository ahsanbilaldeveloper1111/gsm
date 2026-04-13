"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { companyService } from "@/services/company.service";

export function useCompanyDiscountApplicabilityMutations(
  companyId: string | null | undefined,
) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.company.all });
  };

  const createDiscountApplicability = useMutation({
    mutationFn: (body: unknown) =>
      companyService.createDiscountApplicability(companyId as string, body),
    onSuccess: invalidate,
  });

  return { createDiscountApplicability };
}
