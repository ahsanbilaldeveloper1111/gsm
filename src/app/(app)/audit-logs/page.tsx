import { AuditLogsView } from "@/components/views/ListViews";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

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
