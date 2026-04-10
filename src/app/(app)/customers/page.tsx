import { CustomersView } from "@/components/views/ListViews";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Customers"
        description="Customer records and per-customer product pricing."
      />
      <div className="mt-8">
        <CustomersView />
      </div>
    </PageFrame>
  );
}
