import { CompanyView } from "@/components/pages/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

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
