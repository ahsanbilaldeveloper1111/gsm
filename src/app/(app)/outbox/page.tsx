import { OutboxModuleView } from "@/components/views/OutboxModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Outbox" };

export default function OutboxPage() {
  return (
    <PageFrame>
      <PageHeader title="Outbox" description="Filter GSM/port and inspect outgoing message history." />
      <div className="mt-8">
        <OutboxModuleView />
      </div>
    </PageFrame>
  );
}
