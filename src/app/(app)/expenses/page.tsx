import { ExpensesView } from "@/components/pages/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Expenses" };

export default function ExpensesPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Expenses"
        description="Operating expenses, receipts, and attachments."
      />
      <div className="mt-8">
        <ExpensesView />
      </div>
    </PageFrame>
  );
}
