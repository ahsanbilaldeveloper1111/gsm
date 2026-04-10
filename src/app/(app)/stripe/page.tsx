import { StripeModuleView } from "@/components/views/stripe-module-view";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

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
