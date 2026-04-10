"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import type { IndexExpenseParams } from "@/models/expense";
import { expenseService } from "@/services/expenses.service";

export function useExpenses(params?: IndexExpenseParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.expenses.list(
      (params as Record<string, unknown> | undefined) ?? null,
    ),
    queryFn: () => expenseService.list(params),
    enabled,
  });
}
