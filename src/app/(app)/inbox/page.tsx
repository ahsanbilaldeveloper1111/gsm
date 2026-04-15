import { InboxModuleView } from "@/components/views/InboxModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Inbox" };

export default function InboxPage() {
  return (
    <PageFrame>
      <PageHeader title="Inbox" description="Inspect incoming SMS by GSM, port, sender, and message filters." />
      <div className="mt-8">
        <InboxModuleView />
      </div>
    </PageFrame>
  );
}
