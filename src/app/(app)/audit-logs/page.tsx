import { AuditLogsView } from "@/components/views/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Audit logs" };

export default function AuditLogsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Audit logs"
        description="Immutable activity trail for compliance and debugging."
      />
      <div className="mt-8">
        <AuditLogsView />
      </div>
    </PageFrame>
  );
}
