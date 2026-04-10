import { PageFrame } from "@/components/layout/PageFrame";
import { DashboardOverview } from "@/components/views/DashboardOverview";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Dashboard"
        description="Overview of billing metrics and live API snapshots for debugging."
      />
      <div className="mt-10 space-y-10">
        <DashboardOverview />
      </div>
    </PageFrame>
  );
}
