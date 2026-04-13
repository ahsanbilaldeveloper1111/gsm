import { Suspense } from "react";
import { InvoiceCrudView } from "@/components/views/InvoiceCrudView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Invoices" };

export default function InvoicesPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Invoices"
        description="Create, send, and collect on invoices."
      />
      <div className="mt-8">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-zinc-200/80 bg-white/60 p-8 text-sm text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-950/40">
              Loading invoices…
            </div>
          }
        >
          <InvoiceCrudView />
        </Suspense>
      </div>
    </PageFrame>
  );
}
