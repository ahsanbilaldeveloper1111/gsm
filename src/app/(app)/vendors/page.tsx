import { VendorCrudView } from "@/components/views/VendorCrudView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Vendors" };

export default function VendorsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Vendors"
        description="Suppliers and vendor records linked to billing."
      />
      <div className="mt-8">
        <VendorCrudView />
      </div>
    </PageFrame>
  );
}
