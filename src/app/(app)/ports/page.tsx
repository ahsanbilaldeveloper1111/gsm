import { PortsModuleView } from "@/components/views/PortsModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Ports" };

export default function PortsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Ports"
        description="Ports list, filtering, and assignment-oriented telephony operations."
      />
      <div className="mt-8">
        <PortsModuleView />
      </div>
    </PageFrame>
  );
}
