import { CompanyView } from "@/components/views/ListViews";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Company" };

export default function CompanyPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Company"
        description="Tenants, pricing, documents, and company profiles."
      />
      <div className="mt-8">
        <CompanyView />
      </div>
    </PageFrame>
  );
}
