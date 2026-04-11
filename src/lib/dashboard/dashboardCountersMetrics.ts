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

function add(out: CounterMetricEntry[], e: CounterMetricEntry | null) {
  if (e) out.push(e);
}

/**
 * Flattens `GET /analytics/dashboard-counters` (`DashboardCounters`) into
 * metric cards with readable labels.
 */
export function dashboardCounterMetricEntries(
  data: DashboardCounters | null,
): CounterMetricEntry[] {
  if (data == null) return [];
  const out: CounterMetricEntry[] = [];

  const co = data.companies;
  if (co) {
    add(out, int("companies.total", "Companies", co.total));
    add(out, int("companies.active", "Companies (active)", co.active));
    add(out, int("companies.inactive", "Companies (inactive)", co.inactive));
  }

  const cu = data.customers;
  if (cu) {
    add(out, int("customers.total", "Customers", cu.total));
  }

  const pr = data.products;
  if (pr) {
    add(out, int("products.total", "Products", pr.total));
  }

  const re = data.resellers;
  if (re) {
    add(out, int("resellers.total", "Resellers", re.total));
    add(out, int("resellers.active", "Resellers (active)", re.active));
    add(out, int("resellers.inactive", "Resellers (inactive)", re.inactive));
  }

  const inv = data.invoices;
  if (inv) {
    add(out, int("invoices.total", "Invoices", inv.total));
    add(out, int("invoices.draft", "Invoices (draft)", inv.draft));
    add(out, int("invoices.sent", "Invoices (sent)", inv.sent));
    add(out, int("invoices.paid", "Invoices (paid)", inv.paid));
    add(out, int("invoices.overdue", "Invoices (overdue)", inv.overdue));
    add(out, int("invoices.cancelled", "Invoices (cancelled)", inv.cancelled));
    add(out, money("invoices.total_amount", "Invoice total amount", inv.total_amount));
    add(
      out,
      money(
        "invoices.total_amount_with_fees",
        "Invoice total (with fees)",
        inv.total_amount_with_fees,
      ),
    );
    add(out, money("invoices.total_subtotal", "Invoice subtotal", inv.total_subtotal));
    add(out, money("invoices.total_tax_amount", "Invoice tax total", inv.total_tax_amount));
    add(
      out,
      money(
        "invoices.total_processing_fee",
        "Invoice processing fees",
        inv.total_processing_fee,
      ),
    );
    add(
      out,
      money(
        "invoices.total_tax_paid_invoices",
        "Tax (paid invoices)",
        inv.total_tax_paid_invoices,
      ),
    );
    add(
      out,
      money(
        "invoices.total_subtotal_paid_invoices",
        "Subtotal (paid invoices)",
        inv.total_subtotal_paid_invoices,
      ),
    );
    add(
      out,
      money(
        "invoices.prev_month_total_amount",
        "Invoices (prior month amount)",
        inv.prev_month_total_amount,
      ),
    );
    add(out, money("invoices.paid_amount", "Paid amount", inv.paid_amount));
    add(
      out,
      money(
        "invoices.partially_paid_amount",
        "Partially paid amount",
        inv.partially_paid_amount,
      ),
    );
    add(
      out,
      money("invoices.outstanding_amount", "Outstanding amount", inv.outstanding_amount),
    );
    add(out, money("invoices.overdue_amount", "Overdue amount", inv.overdue_amount));
    add(
      out,
      int("invoices.overdue_invoices_count", "Overdue invoices", inv.overdue_invoices_count),
    );
    add(
      out,
      money("invoices.total_processing_fees", "Total processing fees", inv.total_processing_fees),
    );
    add(out, int("invoices.paid_invoices_count", "Paid invoice count", inv.paid_invoices_count));
    add(
      out,
      int(
        "invoices.partially_paid_invoices_count",
        "Partially paid invoice count",
        inv.partially_paid_invoices_count,
      ),
    );
    add(out, int("invoices.unpaid_invoices_count", "Unpaid invoice count", inv.unpaid_invoices_count));
  }

  const ex = data.expenses;
  if (ex) {
    add(out, int("expenses.total", "Expenses (count)", ex.total));
    add(out, money("expenses.total_amount", "Expenses (amount)", ex.total_amount));
    add(out, int("expenses.this_month", "Expenses (this month)", ex.this_month));
    add(out, int("expenses.last_month", "Expenses (last month)", ex.last_month));
  }

  const iv = data.inventory;
  if (iv) {
    add(out, int("inventory.total_items", "Inventory items", iv.total_items));
    add(out, int("inventory.in_stock", "In stock", iv.in_stock));
    add(out, int("inventory.low_stock", "Low stock", iv.low_stock));
    add(out, int("inventory.out_of_stock", "Out of stock", iv.out_of_stock));
    add(out, money("inventory.total_value", "Inventory value", iv.total_value));
    add(out, int("inventory.categories", "Inventory categories", iv.categories));
  }

  const cat = data.categories;
  if (cat) {
    add(
      out,
      int("categories.product_categories", "Product categories", cat.product_categories),
    );
    add(
      out,
      int(
        "categories.expense_categories",
        "Expense categories",
        cat.expense_categories,
      ),
    );
    add(out, int("categories.total_categories", "Total categories", cat.total_categories));
  }

  return out;
}
