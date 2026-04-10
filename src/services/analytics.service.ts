import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiGet, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/api-routes";
import type {
  AnalyticCounterResponse,
  DashboardChartsData,
  DashboardCounters,
  DashboardOverview,
  ExpenseBreakdownItem,
  ExpenseTrendItem,
  InventoryStatusDistribution,
  InventoryValueItem,
  ProductSpentByCompany,
  ProfitLossSummary,
  RecentActivitySummary,
  RevenueTrendItem,
  TopSellingProduct,
} from "@/models/analytics";

async function get<T = unknown>(
  path: string,
  params?: QueryParams,
): Promise<ApiSuccessResponse<T>> {
  return apiGet<ApiSuccessResponse<T>>(path, params);
}

export const analyticsService = {
  dashboardCounters: (p?: QueryParams) =>
    get<DashboardCounters>(apiRoutes.analytics.dashboardCounters(), p),
  dashboardCharts: (p?: QueryParams) =>
    get<DashboardChartsData>(apiRoutes.analytics.dashboardCharts(), p),
  revenueTrend: (p?: QueryParams) =>
    get<RevenueTrendItem[]>(apiRoutes.analytics.revenueTrend(), p),
  expenseTrend: (p?: QueryParams) =>
    get<ExpenseTrendItem[]>(apiRoutes.analytics.expenseTrend(), p),
  inventoryStatus: (p?: QueryParams) =>
    get<InventoryStatusDistribution>(
      apiRoutes.analytics.inventoryStatus(),
      p,
    ),
  topProducts: (p?: QueryParams) =>
    get<TopSellingProduct[]>(apiRoutes.analytics.topProducts(), p),
  expenseBreakdown: (p?: QueryParams) =>
    get<ExpenseBreakdownItem[]>(apiRoutes.analytics.expenseBreakdown(), p),
  inventoryValue: (p?: QueryParams) =>
    get<InventoryValueItem[]>(apiRoutes.analytics.inventoryValue(), p),
  recentActivity: (p?: QueryParams) =>
    get<RecentActivitySummary>(apiRoutes.analytics.recentActivity(), p),
  profitLoss: (p?: QueryParams) =>
    get<ProfitLossSummary>(apiRoutes.analytics.profitLoss(), p),
  productsSpentByCompany: (p?: QueryParams) =>
    get<ProductSpentByCompany[]>(
      apiRoutes.analytics.productsSpentByCompany(),
      p,
    ),
  index: (p?: QueryParams) => get<unknown>(apiRoutes.analytics.index(), p),
  counters: (p?: QueryParams) =>
    get<AnalyticCounterResponse>(apiRoutes.analytics.counters(), p),
  dashboardOverview: (p?: QueryParams) =>
    get<DashboardOverview>(apiRoutes.analytics.dashboardOverview(), p),
  byMonths: (p?: QueryParams) =>
    get<unknown>(apiRoutes.analytics.byMonths(), p),
};

export async function fetchAnalyticsDashboardCounters(): Promise<
  ApiSuccessResponse<DashboardCounters>
> {
  return analyticsService.dashboardCounters();
}

export async function fetchAnalyticsDashboardCharts(): Promise<
  ApiSuccessResponse<DashboardChartsData>
> {
  return analyticsService.dashboardCharts();
}

export async function fetchAnalyticsDashboardOverview(): Promise<
  ApiSuccessResponse<DashboardOverview>
> {
  return analyticsService.dashboardOverview();
}
