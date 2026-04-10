"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexInvoiceParams } from "@/models/Invoice";
import { fetchInvoices } from "@/services/invoices.service";

export function useInvoices(params?: IndexInvoiceParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.invoices.list(
      (params as Record<string, unknown> | undefined) ?? null,
    ),
    queryFn: () => fetchInvoices(params),
    enabled,
  });
}
