import { Suspense } from "react";
import { CompanyProductPricingView } from "@/components/company/CompanyProductPricingView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Company product pricing" };

function PricingFallback() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60" />
    </div>
  );
}

export default async function CompanyProductPricingPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  return (
    <PageFrame>
      <PageHeader
        title="Tenant product pricing"
        description="Per-tenant selling prices, renewals, and discount applicability."
      />
      <div className="mt-8">
        <Suspense fallback={<PricingFallback />}>
          <CompanyProductPricingView tenantId={tenantId} />
        </Suspense>
      </div>
    </PageFrame>
  );
}
