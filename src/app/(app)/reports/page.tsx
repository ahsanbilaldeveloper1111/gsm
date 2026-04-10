import { ReportsModuleView } from "@/components/views/ReportsModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

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
