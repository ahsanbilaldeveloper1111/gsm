import { SyncPortsModuleView } from "@/components/views/SyncPortsModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Sync Ports Data" };

export default function SyncPortsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Sync Ports Data"
        description="Run GSM port sync for IMEI, ICCID, IMSI, SIM status, and mobile numbers."
      />
      <div className="mt-8">
        <SyncPortsModuleView />
      </div>
    </PageFrame>
  );
}
