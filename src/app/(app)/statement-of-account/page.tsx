import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatementOfAccountView } from "@/components/views/StatementOfAccountView";

export const metadata = { title: "Statement of account" };

export default function StatementOfAccountPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Statement of account"
        description="View customer/company statement activity and download the statement PDF."
      />
      <div className="mt-8">
        <StatementOfAccountView />
      </div>
    </PageFrame>
  );
}
