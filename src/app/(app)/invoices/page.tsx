import { InvoicesView } from "@/components/views/ListViews";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Invoices" };

export default function InvoicesPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Invoices"
        description="Create, send, and collect on invoices."
      />
      <div className="mt-8">
        <InvoicesView />
      </div>
    </PageFrame>
  );
}
