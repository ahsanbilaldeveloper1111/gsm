"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import { fetchCompanies } from "@/services/company.service";

export function useCompanies(
  params?: Record<string, string | number | boolean | undefined>,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.company.list(params ?? null),
    queryFn: () => fetchCompanies(params),
    enabled,
  });
}
