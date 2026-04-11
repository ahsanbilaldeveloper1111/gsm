"use client";

import { useMemo } from "react";
import { DashboardChartsSection } from "@/components/dashboard/DashboardChartsSection";
import { DashboardMoreAnalyticsSection } from "@/components/dashboard/DashboardMoreAnalyticsSection";
import { MetricCard } from "@/components/dashboard/MetricCard";
import type { CounterMetricEntry } from "@/lib/dashboard/analyticsCounters";
import { dashboardCounterMetricEntries } from "@/lib/dashboard/dashboardCountersMetrics";
import {
  useAnalyticsByMonths,
  useAnalyticsProductsSpentByCompany,
  useAnalyticsProfitLoss,
  useAnalyticsRecentActivity,
} from "@/hooks/analytics/useAnalyticsEndpoints";
import { useAnalyticsDashboardCharts } from "@/hooks/analytics/useAnalyticsDashboardCharts";
import { useAnalyticsDashboardCounters } from "@/hooks/analytics/useAnalyticsDashboardCounters";
import { unwrapApiSuccessData } from "@/lib/dashboard/unwrapAnalyticsPayload";
import type { DashboardCounters } from "@/models/Analytics";

function formatMetricValue(row: CounterMetricEntry): string {
  if (row.valueStyle === "currency") {
    return row.value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return Number(row.value).toLocaleString();
}

export function DashboardOverview() {
  const dashboardCountersQuery = useAnalyticsDashboardCounters();
  const chartsQuery = useAnalyticsDashboardCharts();
  const profitLossQuery = useAnalyticsProfitLoss(null);
  const recentActivityQuery = useAnalyticsRecentActivity(null);
  const productsSpentQuery = useAnalyticsProductsSpentByCompany(null);
  const byMonthsQuery = useAnalyticsByMonths(null);

  const counterRows = useMemo(() => {
    const raw = unwrapApiSuccessData<DashboardCounters>(
      dashboardCountersQuery.data,
    );
    return dashboardCounterMetricEntries(raw);
  }, [dashboardCountersQuery.data]);

  const moreAnalyticsLoading =
    profitLossQuery.isLoading ||
    recentActivityQuery.isLoading ||
    productsSpentQuery.isLoading ||
    byMonthsQuery.isLoading;

  const chartsError =
    chartsQuery.error instanceof Error
      ? chartsQuery.error
      : new Error(
          chartsQuery.error != null ? String(chartsQuery.error) : "Error",
        );

  const skeletonCount = 16;

  return (
    <>
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Counters
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Key totals from the dashboard counters endpoint (companies, invoices,
            expenses, inventory, and more).
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dashboardCountersQuery.isLoading ? (
            <>
              {Array.from({ length: skeletonCount }, (_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900"
                />
              ))}
            </>
          ) : dashboardCountersQuery.isError ? (
            <p className="text-sm text-rose-600 dark:text-rose-400">
              Counters could not load.
            </p>
          ) : counterRows.length > 0 ? (
            counterRows.map((row) => (
              <MetricCard
                key={row.key}
                label={row.label}
                value={formatMetricValue(row)}
              />
            ))
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No counter data returned.
            </p>
          )}
        </div>
      </section>

      <DashboardChartsSection
        payload={chartsQuery.data}
        isLoading={chartsQuery.isLoading}
        isError={chartsQuery.isError}
        error={chartsQuery.isError ? chartsError : null}
      />

      {moreAnalyticsLoading ? (
        <section className="mt-10">
          <div className="mb-6">
            <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Profit, activity & comparisons
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Loading additional analytics…
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900"
              />
            ))}
          </div>
        </section>
      ) : (
        <DashboardMoreAnalyticsSection
          profitLossPayload={profitLossQuery.data}
          recentActivityPayload={recentActivityQuery.data}
          productsSpentPayload={productsSpentQuery.data}
          byMonthsPayload={byMonthsQuery.data}
        />
      )}
    </>
  );
}
