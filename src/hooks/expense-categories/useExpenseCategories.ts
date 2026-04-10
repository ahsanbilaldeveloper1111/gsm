"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { QueryParams } from "@/lib/api/http";
import { expenseCategoryService } from "@/services/expense-categories.service";

export function useExpenseCategories(params?: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.expenseCategories.list(params ?? null),
    queryFn: () => expenseCategoryService.list(params),
    enabled,
  });
}
