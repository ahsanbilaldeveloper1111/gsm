import { ExpenseCategoriesView } from "@/components/views/ListViews";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

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
