import { ReportsView } from "@/components/pages/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Reports"
        description="Financial and operational reports (sample: dashboard summary)."
      />
      <div className="mt-8">
        <ReportsView />
      </div>
    </PageFrame>
  );
}
