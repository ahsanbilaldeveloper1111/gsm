import { Suspense } from "react";
import { CompanyCrudView } from "@/components/views/CompanyCrudView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Company" };

function CompanyListFallback() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60" />
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-100/60 dark:bg-zinc-800/40" />
    </div>
  );
}

export default function CompanyPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Company"
        description="Tenants, pricing, documents, and company profiles."
      />
      <div className="mt-8">
        <Suspense fallback={<CompanyListFallback />}>
          <CompanyCrudView />
        </Suspense>
      </div>
    </PageFrame>
  );
}
