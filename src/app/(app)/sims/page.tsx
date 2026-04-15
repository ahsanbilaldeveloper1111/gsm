import { SimManagementView } from "@/components/views/SimManagementView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Sim Management" };

export default function SimsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Sim Management"
        description="Manage SIM records with filtering, create, update, and delete actions."
      />
      <div className="mt-8">
        <SimManagementView />
      </div>
    </PageFrame>
  );
}
