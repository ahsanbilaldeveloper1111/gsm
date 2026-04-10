import { InvoicesView } from "@/components/pages/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

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
