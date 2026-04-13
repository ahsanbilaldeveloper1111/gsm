import { Suspense } from "react";
import { ProductCrudView } from "@/components/views/ProductCrudView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Products" };

function ProductsListFallback() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60" />
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-100/60 dark:bg-zinc-800/40" />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Products"
        description="Catalog, categories, and tenant-specific pricing."
      />
      <div className="mt-8">
        <Suspense fallback={<ProductsListFallback />}>
          <ProductCrudView />
        </Suspense>
      </div>
    </PageFrame>
  );
}
