import { RanksView } from "@/components/views/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Ranks" };

export default function RanksPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Ranks"
        description="Permission ranks and module access templates."
      />
      <div className="mt-8">
        <RanksView />
      </div>
    </PageFrame>
  );
}
