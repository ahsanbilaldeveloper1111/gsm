import { NotificationsModuleView } from "@/components/views/NotificationsModuleView";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Notifications"
        description="SMS notification list and statistics from the telephony backend."
      />
      <div className="mt-8">
        <NotificationsModuleView />
      </div>
    </PageFrame>
  );
}
