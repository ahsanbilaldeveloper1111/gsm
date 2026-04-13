"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import { companyService } from "@/services/company.service";

/** Prefetch discount applicability for a company (optional analytics for profile UI). */
export function useCompanyDiscountApplicability(
  companyId: number | string | null | undefined,
) {
  const auth = useAuthQueryEnabled();
  const enabled =
    auth &&
    companyId != null &&
    companyId !== "" &&
    companyId !== 0;
  return useQuery({
    queryKey: queryKeys.company.discountApplicability(companyId ?? null, null),
    queryFn: () => companyService.discountApplicability(companyId as number | string),
    enabled,
  });
}
