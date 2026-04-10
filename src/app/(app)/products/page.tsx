import { ProductsView } from "@/components/views/ListViews";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Products"
        description="Catalog, categories, and tenant-specific pricing."
      />
      <div className="mt-8">
        <ProductsView />
      </div>
    </PageFrame>
  );
}
