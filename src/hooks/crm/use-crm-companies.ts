"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import type { QueryParams } from "@/lib/api/http";
import { crmService } from "@/services/crm.service";

export function useCrmCompanies(params?: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.crm.companies(params ?? null),
    queryFn: () => crmService.companies(params),
    enabled,
  });
}
