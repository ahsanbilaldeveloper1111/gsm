import { PaymentsView } from "@/components/views/ListViews";
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
        <PaymentsView />
      </div>
    </PageFrame>
  );
}
