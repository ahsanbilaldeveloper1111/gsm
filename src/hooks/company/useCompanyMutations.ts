"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { companyService } from "@/services/company.service";

export function useCompanyMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: queryKeys.company.all });

  const createUpdate = useMutation({
    mutationFn: (body: unknown) => companyService.createUpdate(body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number | string) => companyService.deleteCompany(id),
    onSuccess: invalidate,
  });

  return { createUpdate, remove };
}
