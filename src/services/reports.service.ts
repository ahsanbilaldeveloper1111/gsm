import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiGet, apiPost, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/api-routes";
import type { DashboardOverview } from "@/models/analytics";

const r = apiRoutes.reports;

export const reportService = {
  profitLoss: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.profitLoss(), params),

  accountsReceivableAging: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.accountsReceivableAging(), params),

  vatSummary: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.vatSummary(), params),

  customerStatements: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.customerStatements(), params),

  customerStatement: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.customerStatement(), body),

  customerStatementDownload: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.customerStatementDownload(), body),

  paymentHistory: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.paymentHistory(), params),

  arAging: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.arAging(), params),

  salesExpense: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.salesExpense(), params),

  profitLossEnhanced: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.profitLossEnhanced(), params),

  vatSummaryEnhanced: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.vatSummaryEnhanced(), params),

  paymentHistoryEnhanced: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.paymentHistoryEnhanced(), params),

  dashboard: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<DashboardOverview>>(r.dashboard(), params),

  exportReport: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.export(), body),
};
