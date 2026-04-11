"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import type { CreateInvoiceData, UpdateInvoiceData } from "@/models/Invoice";
import { invoiceService } from "@/services/invoices.service";

export function useInvoiceMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: queryKeys.invoices.all });

  const create = useMutation({
    mutationFn: (body: CreateInvoiceData) => invoiceService.create(body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number | string;
      body: UpdateInvoiceData;
    }) => invoiceService.update(id, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number | string) => invoiceService.destroy(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
