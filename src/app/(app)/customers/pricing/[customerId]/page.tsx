import { Suspense } from "react";
import { CustomerProductPricingView } from "@/components/customers/CustomerProductPricingView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Customer product pricing" };

function PricingFallback() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60" />
    </div>
  );
}

export default async function CustomerProductPricingPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;

  return (
    <PageFrame>
      <PageHeader
        title="Customer product pricing"
        description="Per-customer subscription pricing and renewals."
      />
      <div className="mt-8">
        <Suspense fallback={<PricingFallback />}>
          <CustomerProductPricingView customerId={customerId} />
        </Suspense>
      </div>
    </PageFrame>
  );
}
