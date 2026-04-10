import { UsersView } from "@/components/views/list-views";
import { PageFrame } from "@/components/layout/page-frame";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Users" };

export default function UsersPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Users"
        description="Directory users, roles, and account settings via `/api/users`."
      />
      <div className="mt-8">
        <UsersView />
      </div>
    </PageFrame>
  );
}
