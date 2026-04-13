"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexInvoiceParams } from "@/models/Invoice";
import { fetchInvoices } from "@/services/invoices.service";

export function useInvoices(
  params?: IndexInvoiceParams,
  options?: { enabled?: boolean },
) {
  const auth = useAuthQueryEnabled();
  const enabled =
    auth && (options?.enabled === undefined ? true : options.enabled);
  return useQuery({
    queryKey: queryKeys.invoices.list(
      (params as Record<string, unknown> | undefined) ?? null,
    ),
    queryFn: () => fetchInvoices(params),
    enabled,
  });
}
