import { CrmView } from "@/components/pages/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "CRM" };

export default function CrmPage() {
  return (
    <PageFrame>
      <PageHeader
        title="CRM companies"
        description="Proxy view of CRM companies for billing context."
      />
      <div className="mt-8">
        <CrmView />
      </div>
    </PageFrame>
  );
}
