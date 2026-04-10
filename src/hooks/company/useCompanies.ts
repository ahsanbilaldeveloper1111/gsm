"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
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
