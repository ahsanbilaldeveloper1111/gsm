"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { QueryParams } from "@/lib/api/http";
import { analyticsService } from "@/services/analytics.service";

function qp(
  p?: Record<string, unknown> | null,
): QueryParams | undefined {
  return p as QueryParams | undefined;
}

export function useAnalyticsIndex(params?: Record<string, unknown> | null) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.analytics.index(), params ?? null],
    queryFn: () => analyticsService.index(qp(params)),
    enabled,
  });
}

export function useAnalyticsCountersApi(params?: Record<string, unknown> | null) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.analytics.counters(), params ?? null],
    queryFn: () => analyticsService.counters(qp(params)),
    enabled,
  });
}

export function useAnalyticsRevenueTrend(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.analytics.revenueTrend(), params ?? null],
    queryFn: () => analyticsService.revenueTrend(qp(params)),
    enabled,
  });
}

export function useAnalyticsExpenseTrend(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.analytics.expenseTrend(), params ?? null],
    queryFn: () => analyticsService.expenseTrend(qp(params)),
    enabled,
  });
}

export function useAnalyticsInventoryStatus(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.analytics.inventoryStatus(), params ?? null],
    queryFn: () => analyticsService.inventoryStatus(qp(params)),
    enabled,
  });
}

export function useAnalyticsTopProducts(params?: Record<string, unknown> | null) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.analytics.topProducts(), params ?? null],
    queryFn: () => analyticsService.topProducts(qp(params)),
    enabled,
  });
}

export function useAnalyticsExpenseBreakdown(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.analytics.expenseBreakdown(), params ?? null],
    queryFn: () => analyticsService.expenseBreakdown(qp(params)),
    enabled,
  });
}

export function useAnalyticsInventoryValue(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.analytics.inventoryValue(), params ?? null],
    queryFn: () => analyticsService.inventoryValue(qp(params)),
    enabled,
  });
}

export function useAnalyticsRecentActivity(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.analytics.recentActivity(), params ?? null],
    queryFn: () => analyticsService.recentActivity(qp(params)),
    enabled,
  });
}

export function useAnalyticsProfitLoss(params?: Record<string, unknown> | null) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.analytics.profitLoss(), params ?? null],
    queryFn: () => analyticsService.profitLoss(qp(params)),
    enabled,
  });
}

export function useAnalyticsProductsSpentByCompany(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.analytics.productsSpentByCompany(), params ?? null],
    queryFn: () => analyticsService.productsSpentByCompany(qp(params)),
    enabled,
  });
}

export function useAnalyticsByMonths(params?: Record<string, unknown> | null) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.analytics.byMonths(), params ?? null],
    queryFn: () => analyticsService.byMonths(qp(params)),
    enabled,
  });
}
