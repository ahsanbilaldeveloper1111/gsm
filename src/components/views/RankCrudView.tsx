"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudEntityTable } from "@/components/crud/CrudEntityTable";
import { FormField, FormModal } from "@/components/crud/FormModal";
import { RecordDetailModal } from "@/components/crud/RecordDetailModal";
import { useRank } from "@/hooks/ranks/useRank";
import { useRankMutations } from "@/hooks/ranks/useRankMutations";
import { useRanks } from "@/hooks/ranks/useRanks";
import { unwrapApiSuccessData } from "@/lib/dashboard/unwrapAnalyticsPayload";
import {
  showAppToast,
  showBillingBackendErrorToast,
} from "@/lib/toast/appToast";
import type { Rank } from "@/models/Rank";

export function RankCrudView() {
  const listQuery = useRanks();
  const mutations = useRankMutations();
  const [detailId, setDetailId] = useState<number | string | null>(null);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  const detailQuery = useRank(detailId);
  const editQuery = useRank(editId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!formOpen) return;
    if (editId == null) {
      setName("");
      setDescription("");
      return;
    }
    const raw = unwrapApiSuccessData<Rank>(editQuery.data);
    if (!raw) return;
    setName(raw.name ?? "");
    setDescription(raw.description ?? "");
  }, [formOpen, editId, editQuery.data]);

  const openCreate = () => {
    setEditId(null);
    setFormOpen(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editId == null) {
        await mutations.create.mutateAsync({
          name: name.trim(),
          description: description.trim(),
        });
        showAppToast("Rank created.", "success");
      } else {
        await mutations.update.mutateAsync({
          id: editId,
          body: {
            name: name.trim(),
            description: description.trim(),
          },
        });
        showAppToast("Rank updated.", "success");
      }
      setFormOpen(false);
      setEditId(null);
    } catch (err) {
      showBillingBackendErrorToast(err);
    }
  }

  async function confirmDelete() {
    if (deleteId == null) return;
    try {
      await mutations.remove.mutateAsync(deleteId);
      showAppToast("Rank deleted.", "success");
      setDeleteId(null);
    } catch (err) {
      showBillingBackendErrorToast(err);
    }
  }

  return (
    <>
      <CrudEntityTable
        query={listQuery}
        title="Ranks"
        onCreate={openCreate}
        onView={(id) => setDetailId(id)}
        onEdit={(id) => {
          setEditId(id);
          setFormOpen(true);
        }}
        onDelete={(id) => setDeleteId(id)}
      />

      <RecordDetailModal
        open={detailId != null}
        title="Rank"
        subtitle="Permission rank from GET /ranks/{id}."
        data={detailQuery.data ?? null}
        loading={detailQuery.isPending && detailId != null}
        error={detailQuery.isError ? String(detailQuery.error) : null}
        onClose={() => setDetailId(null)}
      />

      <FormModal
        open={formOpen}
        title={editId == null ? "New rank" : "Edit rank"}
        onClose={() => {
          setFormOpen(false);
          setEditId(null);
        }}
        onSubmit={handleSubmit}
        loading={mutations.create.isPending || mutations.update.isPending}
      >
        <FormField label="Name">
          <input
            required
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
        </FormField>
        <FormField label="Description">
          <textarea
            required
            className="min-h-[100px] w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
          />
        </FormField>
      </FormModal>

      <ConfirmDialog
        open={deleteId != null}
        title="Delete rank?"
        message="Deletes via DELETE /ranks/{id}. This may fail if users are still assigned to this rank."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={mutations.remove.isPending}
      />
    </>
  );
}
