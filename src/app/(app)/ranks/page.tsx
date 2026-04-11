import { RankCrudView } from "@/components/views/RankCrudView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Ranks" };

export default function RanksPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Ranks"
        description="Permission ranks and module access templates."
      />
      <div className="mt-8">
        <RankCrudView />
      </div>
    </PageFrame>
  );
}
