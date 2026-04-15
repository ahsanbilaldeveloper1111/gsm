import { UssdModuleView } from "@/components/views/UssdModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "USSD" };

export default function UssdPage() {
  return (
    <PageFrame>
      <PageHeader title="USSD" description="Filter by GSM and port, then view USSD entries." />
      <div className="mt-8">
        <UssdModuleView />
      </div>
    </PageFrame>
  );
}
