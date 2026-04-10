"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchInvoices } from "@/services/invoices.service";
import { useAuth } from "@/contexts/auth-context";

export function useInvoices(
  params?: Record<string, string | number | boolean | undefined>,
) {
  const { token, isBootstrapping } = useAuth();
  return useQuery({
    queryKey: queryKeys.invoices.list(params ?? null),
    queryFn: () => fetchInvoices(params),
    enabled: !isBootstrapping && !!token,
  });
}
