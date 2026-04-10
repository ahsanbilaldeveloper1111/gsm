import { VendorsView } from "@/components/pages/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Vendors" };

export default function VendorsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Vendors"
        description="Suppliers and vendor records linked to billing."
      />
      <div className="mt-8">
        <VendorsView />
      </div>
    </PageFrame>
  );
}
