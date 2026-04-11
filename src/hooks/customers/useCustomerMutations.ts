"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import type { CreateCustomerData, UpdateCustomerData } from "@/models/Customer";
import { customerService } from "@/services/customers.service";

export function useCustomerMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: queryKeys.customers.all });

  const create = useMutation({
    mutationFn: (body: CreateCustomerData) => customerService.create(body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number | string;
      body: UpdateCustomerData;
    }) => customerService.update(id, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number | string) => customerService.destroy(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
