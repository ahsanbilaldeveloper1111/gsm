import { PageFrame } from "@/components/layout/page-frame";
import { DashboardOverview } from "@/components/pages/dashboard-overview";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Dashboard"
        description="Overview of billing metrics and live API snapshots for debugging."
      />
      <div className="mt-8 space-y-10">
        <DashboardOverview />
      </div>
    </PageFrame>
  );
}
