import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiGet, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

async function get(
  path: string,
  params?: QueryParams,
): Promise<ApiSuccessResponse<unknown>> {
  return apiGet<ApiSuccessResponse<unknown>>(path, params);
}

export const analyticsService = {
  dashboardCounters: (p?: QueryParams) =>
    get(apiRoutes.analytics.dashboardCounters(), p),
  dashboardCharts: (p?: QueryParams) =>
    get(apiRoutes.analytics.dashboardCharts(), p),
  revenueTrend: (p?: QueryParams) => get(apiRoutes.analytics.revenueTrend(), p),
  expenseTrend: (p?: QueryParams) => get(apiRoutes.analytics.expenseTrend(), p),
  inventoryStatus: (p?: QueryParams) =>
    get(apiRoutes.analytics.inventoryStatus(), p),
  topProducts: (p?: QueryParams) => get(apiRoutes.analytics.topProducts(), p),
  expenseBreakdown: (p?: QueryParams) =>
    get(apiRoutes.analytics.expenseBreakdown(), p),
  inventoryValue: (p?: QueryParams) =>
    get(apiRoutes.analytics.inventoryValue(), p),
  recentActivity: (p?: QueryParams) =>
    get(apiRoutes.analytics.recentActivity(), p),
  profitLoss: (p?: QueryParams) => get(apiRoutes.analytics.profitLoss(), p),
  productsSpentByCompany: (p?: QueryParams) =>
    get(apiRoutes.analytics.productsSpentByCompany(), p),
  index: (p?: QueryParams) => get(apiRoutes.analytics.index(), p),
  counters: (p?: QueryParams) => get(apiRoutes.analytics.counters(), p),
  dashboardOverview: (p?: QueryParams) =>
    get(apiRoutes.analytics.dashboardOverview(), p),
  byMonths: (p?: QueryParams) => get(apiRoutes.analytics.byMonths(), p),
};

export async function fetchAnalyticsDashboardCounters(): Promise<
  ApiSuccessResponse<unknown>
> {
  return analyticsService.dashboardCounters();
}

export async function fetchAnalyticsDashboardCharts(): Promise<
  ApiSuccessResponse<unknown>
> {
  return analyticsService.dashboardCharts();
}

export async function fetchAnalyticsDashboardOverview(): Promise<
  ApiSuccessResponse<unknown>
> {
  return analyticsService.dashboardOverview();
}
