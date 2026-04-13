import { Suspense } from "react";
import { VendorCrudView } from "@/components/views/VendorCrudView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Vendors" };

function VendorsListFallback() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60" />
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-100/60 dark:bg-zinc-800/40" />
    </div>
  );
}

export default function VendorsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Vendors"
        description="Suppliers and vendor records linked to billing."
      />
      <div className="mt-8">
        <Suspense fallback={<VendorsListFallback />}>
          <VendorCrudView />
        </Suspense>
      </div>
    </PageFrame>
  );
}
