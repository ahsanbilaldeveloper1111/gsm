import { GsmModuleView } from "@/components/views/GsmModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "GSM" };

export default function GsmPage() {
  return (
    <PageFrame>
      <PageHeader
        title="GSM"
        description="GSM devices, assignment profile, and related telephony endpoints."
      />
      <div className="mt-8">
        <GsmModuleView />
      </div>
    </PageFrame>
  );
}
