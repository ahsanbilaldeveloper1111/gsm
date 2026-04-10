import { PaymentsView } from "@/components/pages/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Payments" };

export default function PaymentsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Payments"
        description="Recorded payments, refunds, and payment status."
      />
      <div className="mt-8">
        <PaymentsView />
      </div>
    </PageFrame>
  );
}
