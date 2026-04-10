import { ProductsView } from "@/components/pages/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

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
