"use client";

import { useMemo } from "react";
import { useDisplayCurrency } from "@/contexts/currency-display-context";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { useAnalyticsDashboardCounters } from "@/hooks/analytics/use-analytics-dashboard-counters";
import { useAnalyticsDashboardCharts } from "@/hooks/analytics/use-analytics-dashboard-charts";
import { useAnalyticsDashboardOverview } from "@/hooks/analytics/use-analytics-dashboard-overview";
import { useDashboard } from "@/hooks/dashboard/use-dashboard";
import { JsonPanel } from "@/components/dashboard/json-panel";
import { MetricCard } from "@/components/dashboard/metric-card";

/** Match nested counter keys that represent money (heuristic). */
const MONEY_KEY = /amount|revenue|fee|price|balance|paid|tax|subtotal|outstanding|total|value|cost|net|gross|processing/i;

function flattenNumericLeaves(
  obj: unknown,
  prefix = "",
): { path: string; value: number }[] {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
  const out: { path: string; value: number }[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix} · ${k}` : k;
    if (typeof v === "number" && Number.isFinite(v)) {
      out.push({ path, value: v });
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      out.push(...flattenNumericLeaves(v, path));
    }
  }
  return out;
}

function extractCounterEntries(
  payload: unknown,
  formatMoney: (n: number) => string,
): { label: string; value: string }[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const data = root.data;
  if (!data || typeof data !== "object") return [];
  const leaves = flattenNumericLeaves(data);
  return leaves.slice(0, 12).map(({ path, value }) => {
    const isMoney = MONEY_KEY.test(path.toLowerCase());
    return {
      label: path.replace(/_/g, " "),
      value: isMoney ? formatMoney(value) : value.toLocaleString(),
    };
  });
}

export function DashboardOverview() {
  const { bootstrapError } = useAuth();
  const { formatInCurrency, computedDefault } = useDisplayCurrency();
  const userQuery = useCurrentUser();
  const dashboardQuery = useDashboard();
  const countersQuery = useAnalyticsDashboardCounters();
  const chartsQuery = useAnalyticsDashboardCharts();
  const overviewQuery = useAnalyticsDashboardOverview();

  const metrics = useMemo(
    () =>
      extractCounterEntries(countersQuery.data, (n) =>
        formatInCurrency(n, computedDefault),
      ),
    [countersQuery.data, formatInCurrency, computedDefault],
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
          className="mb-10 rounded-2xl border border-rose-200/90 bg-gradient-to-br from-rose-50 to-white p-5 text-sm text-rose-900 shadow-sm dark:border-rose-900/50 dark:from-rose-950/50 dark:to-zinc-950 dark:text-rose-100"
          role="alert"
        >
          <p className="font-semibold">Could not load API token</p>
          <p className="mt-1 opacity-90">{bootstrapError.message}</p>
          <p className="mt-3 text-xs opacity-80">
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
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Highlights
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Analytics counters — money-like fields use your header currency.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {countersQuery.isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900"
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

      <section className="mt-14 space-y-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            API responses
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Raw JSON for debugging and integration checks.
          </p>
        </div>
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
