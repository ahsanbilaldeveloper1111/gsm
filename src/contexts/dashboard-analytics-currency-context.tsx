"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useDisplayCurrency } from "@/contexts/currency-display-context";
import { useCompanies } from "@/hooks/company/useCompanies";
import { extractListRows } from "@/lib/api/extractApiData";
import type { CounterMetricEntry } from "@/lib/dashboard/analyticsCounters";
import type { Company, IndexCompanyParams } from "@/models/Company";

export type DashboardAnalyticsCurrencyContextValue = {
  /**
   * ISO code the dashboard analytics APIs use for money fields when a tenant is
   * selected (company profile); otherwise the app display default (base / USD).
   */
  sourceCurrencyCode: string;
  /** Format a numeric analytics amount using global display currency rules. */
  formatAnalyticsAmount: (amount: number | null | undefined) => string;
  /** Format a counter metric (currency vs integer). */
  formatCounterMetric: (row: CounterMetricEntry) => string;
};

const DashboardAnalyticsCurrencyContext =
  createContext<DashboardAnalyticsCurrencyContextValue | null>(null);

export type DashboardAnalyticsCurrencyProviderProps = Readonly<{
  children: ReactNode;
  tenantId: string;
  vendorId: string;
}>;

/**
 * Derives dashboard analytics **source** currency once from vendor + tenant filters
 * and exposes stable formatters for counters and charts (single `useCompanies`
 * query, shared with all consumers).
 */
export function DashboardAnalyticsCurrencyProvider({
  children,
  tenantId,
  vendorId,
}: DashboardAnalyticsCurrencyProviderProps) {
  const { formatInCurrency, computedDefault } = useDisplayCurrency();

  const vendorNum = vendorId.trim()
    ? Number.parseInt(vendorId, 10)
    : NaN;

  const companiesQuery = useCompanies(
    {
      page: 1,
      limit: 2000,
      vendor_id: vendorNum,
      load_profile: true,
    } as IndexCompanyParams,
    { enabled: Number.isFinite(vendorNum) },
  );

  const companyRows = extractListRows<Company & Record<string, unknown>>(
    companiesQuery.data,
  ).rows;

  const sourceCurrencyCode = useMemo(() => {
    const tid = tenantId.trim();
    if (!tid) return computedDefault;
    const match = companyRows.find(
      (c) => String(c.tenant_id ?? "").trim() === tid,
    );
    const cur = match?.profile?.currency?.trim();
    return cur ? cur.toUpperCase() : computedDefault;
  }, [tenantId, companyRows, computedDefault]);

  const formatAnalyticsAmount = useCallback(
    (amount: number | null | undefined) =>
      formatInCurrency(amount, sourceCurrencyCode),
    [formatInCurrency, sourceCurrencyCode],
  );

  const formatCounterMetric = useCallback(
    (row: CounterMetricEntry): string => {
      if (row.valueStyle === "currency") {
        return formatInCurrency(row.value, sourceCurrencyCode);
      }
      return Number(row.value).toLocaleString();
    },
    [formatInCurrency, sourceCurrencyCode],
  );

  const value = useMemo<DashboardAnalyticsCurrencyContextValue>(
    () => ({
      sourceCurrencyCode,
      formatAnalyticsAmount,
      formatCounterMetric,
    }),
    [sourceCurrencyCode, formatAnalyticsAmount, formatCounterMetric],
  );

  return (
    <DashboardAnalyticsCurrencyContext.Provider value={value}>
      {children}
    </DashboardAnalyticsCurrencyContext.Provider>
  );
}

export function useDashboardAnalyticsCurrency(): DashboardAnalyticsCurrencyContextValue {
  const ctx = useContext(DashboardAnalyticsCurrencyContext);
  if (!ctx) {
    throw new Error(
      "useDashboardAnalyticsCurrency must be used within DashboardAnalyticsCurrencyProvider",
    );
  }
  return ctx;
}
