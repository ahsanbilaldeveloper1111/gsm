"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { useAnalyticsDashboardCounters } from "@/hooks/analytics/use-analytics-dashboard-counters";
import { useAnalyticsDashboardCharts } from "@/hooks/analytics/use-analytics-dashboard-charts";
import { useAnalyticsDashboardOverview } from "@/hooks/analytics/use-analytics-dashboard-overview";
import { useDashboard } from "@/hooks/dashboard/use-dashboard";
import { JsonPanel } from "@/components/dashboard/json-panel";
import { MetricCard } from "@/components/dashboard/metric-card";

function extractCounterEntries(
  payload: unknown,
): { label: string; value: string }[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const data = root.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return Object.entries(data as Record<string, unknown>)
      .filter(([, v]) => typeof v === "number" || typeof v === "string")
      .slice(0, 6)
      .map(([k, v]) => ({
        label: k.replace(/_/g, " "),
        value: typeof v === "number" ? v.toLocaleString() : String(v),
      }));
  }
  return [];
}

export function DashboardOverview() {
  const { bootstrapError } = useAuth();
  const userQuery = useCurrentUser();
  const dashboardQuery = useDashboard();
  const countersQuery = useAnalyticsDashboardCounters();
  const chartsQuery = useAnalyticsDashboardCharts();
  const overviewQuery = useAnalyticsDashboardOverview();

  const metrics = useMemo(
    () => extractCounterEntries(countersQuery.data),
    [countersQuery.data],
  );

  const dashboardPanelData = useMemo(() => {
    if (dashboardQuery.isError) {
      return { error: String(dashboardQuery.error) };
    }
    return dashboardQuery.data;
  }, [
    dashboardQuery.isError,
    dashboardQuery.error,
    dashboardQuery.data,
  ]);

  const userPanelData = useMemo(() => {
    if (userQuery.isError) {
      return { error: String(userQuery.error) };
    }
    return userQuery.data;
  }, [userQuery.isError, userQuery.error, userQuery.data]);

  const countersPanelData = useMemo(() => {
    if (countersQuery.isError) {
      return { error: String(countersQuery.error) };
    }
    return countersQuery.data;
  }, [countersQuery.isError, countersQuery.error, countersQuery.data]);

  const chartsPanelData = useMemo(() => {
    if (chartsQuery.isError) {
      return { error: String(chartsQuery.error) };
    }
    return chartsQuery.data;
  }, [chartsQuery.isError, chartsQuery.error, chartsQuery.data]);

  const overviewPanelData = useMemo(() => {
    if (overviewQuery.isError) {
      return { error: String(overviewQuery.error) };
    }
    return overviewQuery.data;
  }, [overviewQuery.isError, overviewQuery.error, overviewQuery.data]);

  return (
    <>
      {bootstrapError ? (
        <div
          className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100"
          role="alert"
        >
          <p className="font-medium">Could not load API token</p>
          <p className="mt-1 opacity-90">{bootstrapError.message}</p>
          <p className="mt-2 text-xs opacity-80">
            Set{" "}
            <code className="rounded bg-black/5 px-1 dark:bg-white/10">
              API_APP_SECRET
            </code>{" "}
            for POST{" "}
            <code className="rounded bg-black/5 px-1 dark:bg-white/10">
              /get-token
            </code>{" "}
            or sign in — see your Laravel env.
          </p>
        </div>
      ) : null}

      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Highlights
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          From analytics dashboard counters (first numeric fields).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {countersQuery.isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900"
                />
              ))}
            </>
          ) : metrics.length > 0 ? (
            metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} />
            ))
          ) : (
            <p className="text-sm text-zinc-500">
              No counter fields returned — expand panels below for raw payloads.
            </p>
          )}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          API responses
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <JsonPanel
            title="GET /dashboard"
            subtitle={
              dashboardQuery.isFetching
                ? "Loading…"
                : dashboardQuery.isError
                  ? "Error"
                  : "OK"
            }
            data={dashboardPanelData}
            defaultOpen
          />
          <JsonPanel
            title="GET /user"
            subtitle={
              userQuery.isFetching
                ? "Loading…"
                : userQuery.isError
                  ? "Error"
                  : "OK"
            }
            data={userPanelData}
          />
          <JsonPanel
            title="GET /analytics/dashboard-counters"
            data={countersPanelData}
          />
          <JsonPanel
            title="GET /analytics/dashboard-charts"
            data={chartsPanelData}
          />
          <JsonPanel
            title="GET /analytics/dashboard-overview"
            data={overviewPanelData}
          />
        </div>
      </section>
    </>
  );
}
