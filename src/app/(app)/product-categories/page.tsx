import { ProductCategoriesView } from "@/components/views/ListViews";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

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
