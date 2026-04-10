import { ProductCategoriesView } from "@/components/pages/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Product categories" };

export default function ProductCategoriesPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Product categories"
        description="Hierarchical categories for products and services."
      />
      <div className="mt-8">
        <ProductCategoriesView />
      </div>
    </PageFrame>
  );
}
