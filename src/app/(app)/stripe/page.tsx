import { StripeView } from "@/components/pages/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Stripe" };

export default function StripePage() {
  return (
    <PageFrame>
      <PageHeader
        title="Stripe"
        description="Publishable key and Stripe-backed payment helpers (see API for full flows)."
      />
      <div className="mt-8">
        <StripeView />
      </div>
    </PageFrame>
  );
}
