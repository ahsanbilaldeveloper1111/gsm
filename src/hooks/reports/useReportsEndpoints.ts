"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/queryKeys";
import { reportService } from "@/services/reports.service";

function qp(
  p?: Record<string, unknown> | null,
): QueryParams | undefined {
  return p as QueryParams | undefined;
}

export function useReportsProfitLoss(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.reports.profitLoss(params ?? null),
    queryFn: () => reportService.profitLoss(qp(params)),
    enabled,
  });
}

export function useReportsAccountsReceivableAging(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.reports.accountsReceivableAging(params ?? null),
    queryFn: () => reportService.accountsReceivableAging(qp(params)),
    enabled,
  });
}

export function useReportsVatSummary(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.reports.vatSummary(params ?? null),
    queryFn: () => reportService.vatSummary(qp(params)),
    enabled,
  });
}

export function useReportsCustomerStatements(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.reports.customerStatements(params ?? null),
    queryFn: () => reportService.customerStatements(qp(params)),
    enabled,
  });
}

export function useReportsPaymentHistory(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.reports.paymentHistory(params ?? null),
    queryFn: () => reportService.paymentHistory(qp(params)),
    enabled,
  });
}

export function useReportsArAging(params?: Record<string, unknown> | null) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.reports.arAging(params ?? null),
    queryFn: () => reportService.arAging(qp(params)),
    enabled,
  });
}

export function useReportsSalesExpense(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.reports.salesExpense(params ?? null),
    queryFn: () => reportService.salesExpense(qp(params)),
    enabled,
  });
}

export function useReportsProfitLossEnhanced(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.reports.profitLossEnhanced(params ?? null),
    queryFn: () => reportService.profitLossEnhanced(qp(params)),
    enabled,
  });
}

export function useReportsVatSummaryEnhanced(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.reports.vatSummaryEnhanced(params ?? null),
    queryFn: () => reportService.vatSummaryEnhanced(qp(params)),
    enabled,
  });
}

export function useReportsPaymentHistoryEnhanced(
  params?: Record<string, unknown> | null,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.reports.paymentHistoryEnhanced(params ?? null),
    queryFn: () => reportService.paymentHistoryEnhanced(qp(params)),
    enabled,
  });
}
