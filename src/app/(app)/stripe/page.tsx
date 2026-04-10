import { StripeModuleView } from "@/components/views/StripeModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Stripe" };

export default function StripePage() {
  return (
    <PageFrame>
      <PageHeader
        title="Stripe"
        description="Publishable key, incomplete payments, and fee snapshots (React Query)."
      />
      <div className="mt-8">
        <StripeModuleView />
      </div>
    </PageFrame>
  );
}
