import { CrmView } from "@/components/views/ListViews";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

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
