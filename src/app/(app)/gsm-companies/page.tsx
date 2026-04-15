import { GsmCompaniesModuleView } from "@/components/views/GsmCompaniesModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "GSM Companies" };

export default function GsmCompaniesPage() {
  return (
    <PageFrame>
      <PageHeader
        title="GSM Companies"
        description="Manage GSM-to-company assignments, ports, and quick send operations."
      />
      <div className="mt-8">
        <GsmCompaniesModuleView />
      </div>
    </PageFrame>
  );
}
