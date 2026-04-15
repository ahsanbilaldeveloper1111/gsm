import { CdrModuleView } from "@/components/views/CdrModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Call Detail Recording" };

export default function CdrPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Call Detail Recording"
        description="Filter and inspect call detail records by GSM, port, numbers, and dates."
      />
      <div className="mt-8">
        <CdrModuleView />
      </div>
    </PageFrame>
  );
}
