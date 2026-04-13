import { Suspense } from "react";
import { CustomerCrudView } from "@/components/views/CustomerCrudView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Customers" };

function CustomerListFallback() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60" />
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-100/60 dark:bg-zinc-800/40" />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Customers"
        description="Customer records and per-customer product pricing."
      />
      <div className="mt-8">
        <Suspense fallback={<CustomerListFallback />}>
          <CustomerCrudView />
        </Suspense>
      </div>
    </PageFrame>
  );
}
