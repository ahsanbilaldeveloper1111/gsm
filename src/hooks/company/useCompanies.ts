"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexCompanyParams } from "@/models/Company";
import { fetchCompanies } from "@/services/company.service";

export function useCompanies(
  params?: IndexCompanyParams,
  options?: { enabled?: boolean },
) {
  const auth = useAuthQueryEnabled();
  const enabled =
    auth && (options?.enabled === undefined ? true : options.enabled);
  return useQuery({
    queryKey: queryKeys.company.list(
      (params as Record<string, unknown> | undefined) ?? null,
    ),
    queryFn: () => fetchCompanies(params),
    enabled,
  });
}
