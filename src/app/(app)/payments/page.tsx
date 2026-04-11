import { PaymentListView } from "@/components/views/PaymentListView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Payments" };

export default function PaymentsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Payments"
        description="Recorded payments, refunds, and payment status."
      />
      <div className="mt-8">
        <PaymentListView />
      </div>
    </PageFrame>
  );
}
