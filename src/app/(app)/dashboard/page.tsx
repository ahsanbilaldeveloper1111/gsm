import { PageFrame } from "@/components/layout/PageFrame";
import { DashboardOverview } from "@/components/views/DashboardOverview";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Dashboard"
        description="Telecom overview, assignments, inbox, and usage charts — powered by your dashboard API."
      />
      <div className="mt-8 space-y-10">
        <DashboardOverview />
      </div>
    </PageFrame>
  );
}
