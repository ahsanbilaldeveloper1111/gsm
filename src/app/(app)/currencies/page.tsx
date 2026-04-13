import { Suspense } from "react";
import { CurrencyCrudView } from "@/components/views/CurrencyCrudView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Currencies" };

function CurrenciesListFallback() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60" />
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-100/60 dark:bg-zinc-800/40" />
    </div>
  );
}

export default function CurrenciesPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Currencies"
        description="Supported currencies, FX rates, and conversions."
      />
      <div className="mt-8">
        <Suspense fallback={<CurrenciesListFallback />}>
          <CurrencyCrudView />
        </Suspense>
      </div>
    </PageFrame>
  );
}
