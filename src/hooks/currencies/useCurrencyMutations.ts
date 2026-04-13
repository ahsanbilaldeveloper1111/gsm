"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import type { CreateCurrencyData, UpdateCurrencyData } from "@/models/Currency";
import { currencyService } from "@/services/currencies.service";

export function useCurrencyMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: queryKeys.currencies.all });

  const create = useMutation({
    mutationFn: (body: CreateCurrencyData) => currencyService.add(body),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number | string;
      body: UpdateCurrencyData;
    }) => currencyService.update(id, body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number | string) => currencyService.destroy(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
