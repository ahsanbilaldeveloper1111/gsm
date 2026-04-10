"use client";

import { JsonApiSection } from "@/components/views/JsonApiSection";
import {
  useAnalyticsByMonths,
  useAnalyticsCountersApi,
  useAnalyticsExpenseBreakdown,
  useAnalyticsExpenseTrend,
  useAnalyticsIndex,
  useAnalyticsInventoryStatus,
  useAnalyticsInventoryValue,
  useAnalyticsProductsSpentByCompany,
  useAnalyticsProfitLoss,
  useAnalyticsRecentActivity,
  useAnalyticsRevenueTrend,
  useAnalyticsTopProducts,
} from "@/hooks/analytics/useAnalyticsEndpoints";

function panelPayload(q: {
  isError: boolean;
  error: unknown;
  data: unknown;
}) {
  if (q.isError) return { error: String(q.error) };
  return q.data;
}

function subtitle(q: { isFetching: boolean; isError: boolean }) {
  if (q.isFetching) return "Loading…";
  if (q.isError) return "Error";
  return "OK";
}

export function AnalyticsModuleView() {
  const index = useAnalyticsIndex(null);
  const counters = useAnalyticsCountersApi(null);
  const revenue = useAnalyticsRevenueTrend(null);
  const expense = useAnalyticsExpenseTrend(null);
  const inventoryStatus = useAnalyticsInventoryStatus(null);
  const topProducts = useAnalyticsTopProducts(null);
  const expenseBreakdown = useAnalyticsExpenseBreakdown(null);
  const inventoryValue = useAnalyticsInventoryValue(null);
  const recentActivity = useAnalyticsRecentActivity(null);
  const profitLoss = useAnalyticsProfitLoss(null);
  const productsSpent = useAnalyticsProductsSpentByCompany(null);
  const byMonths = useAnalyticsByMonths(null);

  return (
    <JsonApiSection
      heading="Analytics endpoints"
      panels={[
        {
          title: "GET /analytics",
          subtitle: subtitle(index),
          data: panelPayload(index),
          defaultOpen: true,
        },
        {
          title: "GET /analytics/counters",
          subtitle: subtitle(counters),
          data: panelPayload(counters),
        },
        {
          title: "GET /analytics/revenue-trend",
          subtitle: subtitle(revenue),
          data: panelPayload(revenue),
        },
        {
          title: "GET /analytics/expense-trend",
          subtitle: subtitle(expense),
          data: panelPayload(expense),
        },
        {
          title: "GET /analytics/inventory-status",
          subtitle: subtitle(inventoryStatus),
          data: panelPayload(inventoryStatus),
        },
        {
          title: "GET /analytics/top-products",
          subtitle: subtitle(topProducts),
          data: panelPayload(topProducts),
        },
        {
          title: "GET /analytics/expense-breakdown",
          subtitle: subtitle(expenseBreakdown),
          data: panelPayload(expenseBreakdown),
        },
        {
          title: "GET /analytics/inventory-value",
          subtitle: subtitle(inventoryValue),
          data: panelPayload(inventoryValue),
        },
        {
          title: "GET /analytics/recent-activity",
          subtitle: subtitle(recentActivity),
          data: panelPayload(recentActivity),
        },
        {
          title: "GET /analytics/profit-loss",
          subtitle: subtitle(profitLoss),
          data: panelPayload(profitLoss),
        },
        {
          title: "GET /analytics/products-spent-by-company",
          subtitle: subtitle(productsSpent),
          data: panelPayload(productsSpent),
        },
        {
          title: "GET /analytics/by-months",
          subtitle: subtitle(byMonths),
          data: panelPayload(byMonths),
        },
      ]}
    />
  );
}
