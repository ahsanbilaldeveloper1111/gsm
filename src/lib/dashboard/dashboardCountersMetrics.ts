import type { CounterMetricEntry } from "@/lib/dashboard/analyticsCounters";
import { toFiniteNumber } from "@/lib/dashboard/unwrapAnalyticsPayload";
import type { DashboardCounters } from "@/models/Analytics";

function int(
  key: string,
  label: string,
  raw: unknown,
): CounterMetricEntry | null {
  if (raw === undefined) return null;
  return { key, label, value: toFiniteNumber(raw), valueStyle: "integer" };
}

function money(
  key: string,
  label: string,
  raw: unknown,
): CounterMetricEntry | null {
  if (raw === undefined) return null;
  return { key, label, value: toFiniteNumber(raw), valueStyle: "currency" };
}

function nonNull<T>(x: T | null): x is T {
  return x != null;
}

/** Single metric card vs one box with circular nested metrics. */
export type DashboardCounterBlock =
  | { kind: "single"; entry: CounterMetricEntry }
  | { kind: "circles"; id: string; title: string; items: CounterMetricEntry[] };

/**
 * Ordered dashboard counter blocks: **single** metrics first, then **nested**
 * groups (shown as one card with circular badges per sub-metric).
 */
export function buildDashboardCounterBlocks(
  data: DashboardCounters | null,
): DashboardCounterBlock[] {
  if (data == null) return [];
  const blocks: DashboardCounterBlock[] = [];

  const cu = data.customers;
  if (cu) {
    const e = int("customers.total", "Customers", cu.total);
    if (e) blocks.push({ kind: "single", entry: e });
  }

  const pr = data.products;
  if (pr) {
    const e = int("products.total", "Products", pr.total);
    if (e) blocks.push({ kind: "single", entry: e });
  }

  const co = data.companies;
  if (co) {
    const items = [
      int("companies.total", "Total", co.total),
      int("companies.active", "Active", co.active),
      int("companies.inactive", "Inactive", co.inactive),
    ].filter(nonNull);
    if (items.length > 1) {
      blocks.push({
        kind: "circles",
        id: "companies",
        title: "Companies",
        items,
      });
    } else if (items.length === 1) {
      blocks.push({ kind: "single", entry: items[0]! });
    }
  }

  const cat = data.categories;
  if (cat) {
    const items = [
      int("categories.product_categories", "Product", cat.product_categories),
      int("categories.expense_categories", "Expense", cat.expense_categories),
      int("categories.total_categories", "Total", cat.total_categories),
    ].filter(nonNull);
    if (items.length > 1) {
      blocks.push({
        kind: "circles",
        id: "categories",
        title: "Categories",
        items,
      });
    } else if (items.length === 1) {
      blocks.push({ kind: "single", entry: items[0]! });
    }
  }

  // const ex = data.expenses;
  // if (ex) {
  //   const items = [
  //     int("expenses.total", "Count", ex.total),
  //     money("expenses.total_amount", "Amount", ex.total_amount),
  //     int("expenses.this_month", "This month", ex.this_month),
  //     int("expenses.last_month", "Last month", ex.last_month),
  //   ].filter(nonNull);
  //   if (items.length > 1) {
  //     blocks.push({
  //       kind: "circles",
  //       id: "expenses",
  //       title: "Expenses",
  //       items,
  //     });
  //   } else if (items.length === 1) {
  //     blocks.push({ kind: "single", entry: items[0]! });
  //   }
  // }

  // const iv = data.inventory;
  // if (iv) {
  //   const items = [
  //     int("inventory.total_items", "Items", iv.total_items),
  //     int("inventory.in_stock", "In stock", iv.in_stock),
  //     int("inventory.low_stock", "Low", iv.low_stock),
  //     int("inventory.out_of_stock", "Out", iv.out_of_stock),
  //     int("inventory.categories", "Categories", iv.categories),
  //     money("inventory.total_value", "Value", iv.total_value),
  //   ].filter(nonNull);
  //   if (items.length > 1) {
  //     blocks.push({
  //       kind: "circles",
  //       id: "inventory",
  //       title: "Inventory",
  //       items,
  //     });
  //   } else if (items.length === 1) {
  //     blocks.push({ kind: "single", entry: items[0]! });
  //   }
  // }

  const inv = data.invoices;
  if (inv) {
    const pipeline = [
      int("invoices.total", "Total", inv.total),
      int("invoices.draft", "Draft", inv.draft),
      int("invoices.sent", "Sent", inv.sent),
      int("invoices.paid", "Paid", inv.paid),
      int("invoices.overdue", "Overdue", inv.overdue),
      int("invoices.cancelled", "Cancelled", inv.cancelled),
    ].filter(nonNull);
    if (pipeline.length > 1) {
      blocks.push({
        kind: "circles",
        id: "invoices-pipeline",
        title: "Invoices — status",
        items: pipeline,
      });
    }

    const amounts = [
      money("invoices.total_amount", "Total", inv.total_amount),
      money("invoices.paid_amount", "Paid", inv.paid_amount),
      money("invoices.outstanding_amount", "Outstanding", inv.outstanding_amount),
      money("invoices.overdue_amount", "Overdue", inv.overdue_amount),
      money(
        "invoices.partially_paid_amount",
        "Partially paid",
        inv.partially_paid_amount,
      ),
      money(
        "invoices.prev_month_total_amount",
        "Prior month",
        inv.prev_month_total_amount,
      ),
    ].filter(nonNull);
    if (amounts.length > 1) {
      blocks.push({
        kind: "circles",
        id: "invoices-amounts",
        title: "Invoices — amounts",
        items: amounts,
      });
    }

    const singles: CounterMetricEntry[] = [];
    const pushSingle = (e: CounterMetricEntry | null) => {
      if (e) singles.push(e);
    };
    pushSingle(
      money(
        "invoices.total_amount_with_fees",
        "Invoice total (with fees)",
        inv.total_amount_with_fees,
      ),
    );
    pushSingle(money("invoices.total_subtotal", "Invoice subtotal", inv.total_subtotal));
    pushSingle(money("invoices.total_tax_amount", "Invoice tax total", inv.total_tax_amount));
    pushSingle(
      money(
        "invoices.total_processing_fee",
        "Processing fee",
        inv.total_processing_fee,
      ),
    );
    pushSingle(
      money(
        "invoices.total_tax_paid_invoices",
        "Tax (paid invoices)",
        inv.total_tax_paid_invoices,
      ),
    );
    pushSingle(
      money(
        "invoices.total_subtotal_paid_invoices",
        "Subtotal (paid)",
        inv.total_subtotal_paid_invoices,
      ),
    );
    pushSingle(
      int("invoices.overdue_invoices_count", "Overdue count", inv.overdue_invoices_count),
    );
    pushSingle(
      money("invoices.total_processing_fees", "Processing fees", inv.total_processing_fees),
    );
    pushSingle(int("invoices.paid_invoices_count", "Paid count", inv.paid_invoices_count));
    pushSingle(
      int(
        "invoices.partially_paid_invoices_count",
        "Partially paid count",
        inv.partially_paid_invoices_count,
      ),
    );
    pushSingle(int("invoices.unpaid_invoices_count", "Unpaid count", inv.unpaid_invoices_count));

    for (const entry of singles) {
      blocks.push({ kind: "single", entry });
    }
  }

  return blocks;
}

/**
 * @deprecated Prefer {@link buildDashboardCounterBlocks} for dashboard UI.
 */
export function dashboardCounterMetricEntries(
  data: DashboardCounters | null,
): CounterMetricEntry[] {
  const blocks = buildDashboardCounterBlocks(data);
  const out: CounterMetricEntry[] = [];
  for (const b of blocks) {
    if (b.kind === "single") out.push(b.entry);
    else out.push(...b.items);
  }
  return out;
}
