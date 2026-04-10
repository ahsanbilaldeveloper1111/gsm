import { ExpensesModuleView } from "@/components/views/expenses-module-view";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Expenses" };

export default function ExpensesPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Expenses"
        description="Create, edit, and delete expenses. Categories load from the expense-categories API."
      />
      <div className="mt-8">
        <ExpensesModuleView />
      </div>
    </PageFrame>
  );
}
