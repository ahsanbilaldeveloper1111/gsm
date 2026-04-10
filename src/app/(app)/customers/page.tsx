import { CustomersView } from "@/components/views/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

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
