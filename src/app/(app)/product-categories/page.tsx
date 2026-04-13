import { Suspense } from "react";
import { ProductCategoryCrudView } from "@/components/views/ProductCategoryCrudView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Product categories" };

function ProductCategoriesFallback() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60" />
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-100/60 dark:bg-zinc-800/40" />
    </div>
  );
}

export default function ProductCategoriesPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Product categories"
        description="Hierarchical categories for products and services."
      />
      <div className="mt-8">
        <Suspense fallback={<ProductCategoriesFallback />}>
          <ProductCategoryCrudView />
        </Suspense>
      </div>
    </PageFrame>
  );
}
