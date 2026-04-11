"use client";

import { useState } from "react";
import { CrudEntityTable } from "@/components/crud/CrudEntityTable";
import { RecordDetailModal } from "@/components/crud/RecordDetailModal";
import { useUser } from "@/hooks/users/useUser";
import { useUsers } from "@/hooks/users/useUsers";

/**
 * Users directory with View → full record from GET /users/{id}.
 */
export function UserListView() {
  const listQuery = useUsers();
  const [detailId, setDetailId] = useState<number | string | null>(null);
  const detailQuery = useUser(detailId);

  return (
    <>
      <CrudEntityTable
        query={listQuery}
        title="Users"
        onView={(id) => setDetailId(id)}
      />

      <RecordDetailModal
        open={detailId != null}
        title="User"
        subtitle="User profile and access info from GET /users/{id}."
        data={detailQuery.data ?? null}
        loading={detailQuery.isPending && detailId != null}
        error={detailQuery.isError ? String(detailQuery.error) : null}
        onClose={() => setDetailId(null)}
      />
    </>
  );
}
