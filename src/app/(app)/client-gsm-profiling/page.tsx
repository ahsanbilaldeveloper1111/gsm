import { ClientGsmProfilingModuleView } from "@/components/views/ClientGsmProfilingModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Client GSM Profiling" };

export default function ClientGsmProfilingPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Client GSM Profiling"
        description="View company-to-GSM and assigned-port profiling metrics."
      />
      <div className="mt-8">
        <ClientGsmProfilingModuleView />
      </div>
    </PageFrame>
  );
}
