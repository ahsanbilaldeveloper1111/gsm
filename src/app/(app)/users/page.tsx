import { UsersView } from "@/components/views/ListViews";
import { PageFrame } from "@/components/layout/PageFrame";
import { PageHeader } from "@/components/ui/PageHeader";

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
