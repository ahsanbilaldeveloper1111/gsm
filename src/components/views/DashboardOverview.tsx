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
      <section className="rounded-2xl border border-zinc-200/50 bg-white/45 p-6 shadow-[0_4px_32px_-12px_rgba(15,23,42,0.07)] backdrop-blur-[2px] dark:border-zinc-800/50 dark:bg-zinc-950/40 dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.45)] sm:rounded-3xl sm:p-8">
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/40"
              aria-hidden
            />
            Counters
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Key totals from dashboard counters: companies, invoices, expenses,
            inventory, and more.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dashboardCountersQuery.isLoading ? (
            <>
              {Array.from({ length: skeletonCount }, (_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl bg-gradient-to-br from-zinc-100/90 via-white to-emerald-50/30 dark:from-zinc-800 dark:via-zinc-900 dark:to-emerald-950/20"
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
        <section className="mt-10 rounded-2xl border border-zinc-200/40 bg-white/30 p-6 dark:border-zinc-800/40 dark:bg-zinc-950/30 sm:rounded-3xl sm:p-8">
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              <span
                className="h-2 w-2 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 shadow-sm shadow-sky-500/35"
                aria-hidden
              />
              Profit, activity & comparisons
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Loading additional analytics…
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-2xl bg-gradient-to-br from-zinc-100/90 via-white to-teal-50/20 dark:from-zinc-800 dark:via-zinc-900 dark:to-teal-950/15"
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
