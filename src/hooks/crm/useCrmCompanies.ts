"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { QueryParams } from "@/lib/api/http";
import { crmService } from "@/services/crm.service";

export function useCrmCompanies(
  params?: QueryParams,
  options?: { enabled?: boolean },
) {
  const auth = useAuthQueryEnabled();
  const enabled =
    auth && (options?.enabled === undefined ? true : options.enabled);
  return useQuery({
    queryKey: queryKeys.crm.companies(params ?? null),
    queryFn: () => crmService.companies(params),
    enabled,
  });
}
