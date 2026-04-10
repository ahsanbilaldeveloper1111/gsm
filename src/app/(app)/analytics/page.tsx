import { AnalyticsModuleView } from "@/components/views/analytics-module-view";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Analytics"
        description="Revenue, expense, and operational analytics from the Accounts API."
      />
      <div className="mt-8">
        <AnalyticsModuleView />
      </div>
    </PageFrame>
  );
}
