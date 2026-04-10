import { ReportsModuleView } from "@/components/views/reports-module-view";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Reports"
        description="Financial and operational reports — live JSON from each GET endpoint."
      />
      <div className="mt-8">
        <ReportsModuleView />
      </div>
    </PageFrame>
  );
}
