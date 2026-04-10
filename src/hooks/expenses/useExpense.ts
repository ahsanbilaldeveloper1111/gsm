"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import { expenseService } from "@/services/expenses.service";

export function useExpense(id: number | string | null | undefined) {
  const auth = useAuthQueryEnabled();
  const enabled = auth && id != null && id !== "";
  return useQuery({
    queryKey: queryKeys.expenses.detail(id ?? null),
    queryFn: () => expenseService.show(id as number | string),
    enabled,
  });
}
