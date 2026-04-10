import { ExpenseCategoriesView } from "@/components/views/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Expense categories" };

export default function ExpenseCategoriesPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Expense categories"
        description="Chart of expense categories with soft-delete and restore."
      />
      <div className="mt-8">
        <ExpenseCategoriesView />
      </div>
    </PageFrame>
  );
}
