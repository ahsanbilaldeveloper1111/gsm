import { InventoryModuleView } from "@/components/views/InventoryModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

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
