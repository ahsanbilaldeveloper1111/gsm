import { AnalyticsModuleView } from "@/components/views/AnalyticsModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

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
