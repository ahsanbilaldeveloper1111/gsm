import { ConversationsModuleView } from "@/components/views/ConversationsModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Conversations" };

export default function ConversationsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Conversations"
        description="Conversation inbox with status and aggregate statistics endpoints."
      />
      <div className="mt-8">
        <ConversationsModuleView />
      </div>
    </PageFrame>
  );
}
