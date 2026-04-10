import { InventoryModuleView } from "@/components/views/inventory-module-view";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Inventory" };

export default function InventoryPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Inventory"
        description="List, summary, stats, locations, suppliers, and items (React Query)."
      />
      <div className="mt-8">
        <InventoryModuleView />
      </div>
    </PageFrame>
  );
}
