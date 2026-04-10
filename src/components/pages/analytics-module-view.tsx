"use client";

import { useQuery } from "@tanstack/react-query";
import { JsonApiSection } from "@/components/pages/json-api-section";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import { analyticsService } from "@/services/analytics.service";

export function AnalyticsModuleView() {
  const enabled = useAuthQueryEnabled();

  const index = useQuery({
    queryKey: queryKeys.analytics.index(),
    queryFn: () => analyticsService.index(),
    enabled,
  });
  const counters = useQuery({
    queryKey: queryKeys.analytics.counters(),
    queryFn: () => analyticsService.counters(),
    enabled,
  });
  const revenue = useQuery({
    queryKey: queryKeys.analytics.revenueTrend(),
    queryFn: () => analyticsService.revenueTrend(),
    enabled,
  });
  const expense = useQuery({
    queryKey: queryKeys.analytics.expenseTrend(),
    queryFn: () => analyticsService.expenseTrend(),
    enabled,
  });

  return (
    <JsonApiSection
      heading="Analytics endpoints"
      panels={[
        {
          title: "GET /analytics",
          subtitle: index.isFetching ? "Loading…" : index.isError ? "Error" : "OK",
          data: index.isError ? { error: String(index.error) } : index.data,
          defaultOpen: true,
        },
        {
          title: "GET /analytics/counters",
          data: counters.isError ? { error: String(counters.error) } : counters.data,
        },
        {
          title: "GET /analytics/revenue-trend",
          data: revenue.isError ? { error: String(revenue.error) } : revenue.data,
        },
        {
          title: "GET /analytics/expense-trend",
          data: expense.isError ? { error: String(expense.error) } : expense.data,
        },
      ]}
    />
  );
}
