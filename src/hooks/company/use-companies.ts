"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchCompanies } from "@/services/company.service";
import { useAuth } from "@/contexts/auth-context";

export function useCompanies(
  params?: Record<string, string | number | boolean | undefined>,
) {
  const { token, isBootstrapping } = useAuth();
  return useQuery({
    queryKey: queryKeys.company.list(params ?? null),
    queryFn: () => fetchCompanies(params),
    enabled: !isBootstrapping && !!token,
  });
}
