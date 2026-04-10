"use client";

import { JsonApiSection } from "@/components/views/JsonApiSection";
import { useReportsDashboard } from "@/hooks/reports/useReportsDashboard";
import {
  useReportsAccountsReceivableAging,
  useReportsArAging,
  useReportsCustomerStatements,
  useReportsPaymentHistory,
  useReportsPaymentHistoryEnhanced,
  useReportsProfitLoss,
  useReportsProfitLossEnhanced,
  useReportsSalesExpense,
  useReportsVatSummary,
  useReportsVatSummaryEnhanced,
} from "@/hooks/reports/useReportsEndpoints";

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

export function ReportsModuleView() {
  const dashboard = useReportsDashboard();
  const profitLoss = useReportsProfitLoss(null);
  const profitLossEnhanced = useReportsProfitLossEnhanced(null);
  const ar = useReportsAccountsReceivableAging(null);
  const arAlt = useReportsArAging(null);
  const vat = useReportsVatSummary(null);
  const vatEnhanced = useReportsVatSummaryEnhanced(null);
  const customerStatements = useReportsCustomerStatements(null);
  const paymentHistory = useReportsPaymentHistory(null);
  const paymentHistoryEnhanced = useReportsPaymentHistoryEnhanced(null);
  const salesExpense = useReportsSalesExpense(null);

  return (
    <JsonApiSection
      heading="Report endpoints"
      panels={[
        {
          title: "GET /reports/dashboard",
          subtitle: subtitle(dashboard),
          data: panelPayload(dashboard),
          defaultOpen: true,
        },
        {
          title: "GET /reports/profit-loss",
          subtitle: subtitle(profitLoss),
          data: panelPayload(profitLoss),
        },
        {
          title: "GET /reports/profit-loss (enhanced)",
          subtitle: subtitle(profitLossEnhanced),
          data: panelPayload(profitLossEnhanced),
        },
        {
          title: "GET /reports/accounts-receivable-aging",
          subtitle: subtitle(ar),
          data: panelPayload(ar),
        },
        {
          title: "GET /reports/ar-aging",
          subtitle: subtitle(arAlt),
          data: panelPayload(arAlt),
        },
        {
          title: "GET /reports/vat-summary",
          subtitle: subtitle(vat),
          data: panelPayload(vat),
        },
        {
          title: "GET /reports/vat-summary (enhanced)",
          subtitle: subtitle(vatEnhanced),
          data: panelPayload(vatEnhanced),
        },
        {
          title: "GET /reports/customer-statements",
          subtitle: subtitle(customerStatements),
          data: panelPayload(customerStatements),
        },
        {
          title: "GET /reports/payment-history",
          subtitle: subtitle(paymentHistory),
          data: panelPayload(paymentHistory),
        },
        {
          title: "GET /reports/payment-history (enhanced)",
          subtitle: subtitle(paymentHistoryEnhanced),
          data: panelPayload(paymentHistoryEnhanced),
        },
        {
          title: "GET /reports/sales-expense",
          subtitle: subtitle(salesExpense),
          data: panelPayload(salesExpense),
        },
      ]}
    />
  );
}
