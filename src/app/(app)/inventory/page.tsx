import { InventoryView } from "@/components/pages/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Inventory" };

export default function InventoryPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Inventory"
        description="Stock locations, items, suppliers, and movements."
      />
      <div className="mt-8">
        <InventoryView />
      </div>
    </PageFrame>
  );
}
