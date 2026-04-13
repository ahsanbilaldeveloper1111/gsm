"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import type { CreatePaymentData } from "@/models/Payment";
import { paymentService } from "@/services/payments.service";

export function usePaymentMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
    void qc.invalidateQueries({ queryKey: queryKeys.payments.all });
  };

  const create = useMutation({
    mutationFn: (body: CreatePaymentData | FormData) =>
      body instanceof FormData
        ? paymentService.createForm(body)
        : paymentService.create(body),
    onSuccess: invalidate,
  });

  return { create };
}
