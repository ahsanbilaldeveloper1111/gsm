"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/queryKeys";
import { companyService } from "@/services/company.service";

export function useCompanyDiscountApplicabilityListQuery(
  companyId: string | null | undefined,
  params?: QueryParams,
) {
  const auth = useAuthQueryEnabled();
  const enabled =
    auth && companyId != null && String(companyId).trim() !== "";

  return useQuery({
    queryKey: queryKeys.company.discountApplicabilityList(
      companyId ?? null,
      (params as Record<string, unknown> | undefined) ?? null,
    ),
    queryFn: () =>
      companyService.discountApplicabilityList(companyId as string, params),
    enabled,
  });
}
