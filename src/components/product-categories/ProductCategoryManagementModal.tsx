"use client";

import { useMemo, useState, type FormEvent } from "react";
import { DeleteConfirmationDialog } from "@/components/crud/DeleteConfirmationDialog";
import { FormField } from "@/components/crud/FormModal";
import { useProductCategories } from "@/hooks/product-categories/useProductCategories";
import { useProductCategoryMutations } from "@/hooks/product-categories/useProductCategoryMutations";
import { extractListRows } from "@/lib/api/extractApiData";
import { showAppToast, showBillingBackendErrorToast } from "@/lib/toast/appToast";

type Row = { id: number; name?: string };

type ProductCategoryManagementModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ProductCategoryManagementModal({
  open,
  onClose,
}: ProductCategoryManagementModalProps) {
  const listQ = useProductCategories({ limit: 500 });
  const mutations = useProductCategoryMutations();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const rows = useMemo(() => {
    const { rows: r } = extractListRows<Row>(listQ.data);
    return r.filter((x) => x.id != null).sort((a, b) => {
      const an = (a.name ?? "").toLowerCase();
      const bn = (b.name ?? "").toLowerCase();
      return an.localeCompare(bn);
    });
  }, [listQ.data]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      showAppToast("Enter a category name.", "error");
      return;
    }
    try {
      await mutations.create.mutateAsync({ name });
      showAppToast("Category created.", "success");
      setNewName("");
    } catch (err) {
      showBillingBackendErrorToast(err);
    }
  }

  async function saveEdit() {
    if (editingId == null) return;
    const name = editingName.trim();
    if (!name) {
      showAppToast("Name is required.", "error");
      return;
    }
    try {
      await mutations.update.mutateAsync({
        id: editingId,
        body: { name },
      });
      showAppToast("Category updated.", "success");
      setEditingId(null);
    } catch (err) {
      showBillingBackendErrorToast(err);
    }
  }

  async function confirmDelete() {
    if (deleteId == null) return;
    try {
      await mutations.remove.mutateAsync(deleteId);
      showAppToast("Category deleted.", "success");
      setDeleteId(null);
    } catch (err) {
      showBillingBackendErrorToast(err);
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
        <button
          type="button"
          className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm dark:bg-black/60"
          aria-label="Close"
          onClick={onClose}
        />
        <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200/70 px-5 py-3 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Product categories
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          </div>
          <div className="overflow-y-auto px-5 py-4">
            <form onSubmit={handleCreate} className="mb-6 flex gap-2">
              <div className="min-w-0 flex-1">
                <FormField label="New category">
                  <input
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Name"
                  />
                </FormField>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={mutations.create.isPending}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </form>

            {listQ.isPending ? (
              <p className="text-sm text-zinc-500">Loading…</p>
            ) : listQ.isError ? (
              <p className="text-sm text-rose-600">{String(listQ.error)}</p>
            ) : (
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {rows.length === 0 ? (
                  <li className="py-4 text-center text-sm text-zinc-500">
                    No categories yet.
                  </li>
                ) : (
                  rows.map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-wrap items-center gap-2 py-3"
                    >
                      {editingId === row.id ? (
                        <>
                          <input
                            className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={mutations.update.isPending}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-medium text-white"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-700"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="min-w-0 flex-1 font-medium text-zinc-900 dark:text-zinc-100">
                            {row.name ?? `— (${row.id})`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(row.id);
                              setEditingName(row.name ?? "");
                            }}
                            className="rounded-lg bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(row.id)}
                            className="rounded-lg bg-rose-100 px-2 py-1 text-xs text-rose-900 dark:bg-rose-950/50 dark:text-rose-100"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog
        show={deleteId != null}
        title="Delete category?"
        message="This cannot be undone. The API may reject the delete if categories are in use."
        itemName={
          deleteId != null
            ? rows.find((r) => r.id === deleteId)?.name ?? undefined
            : undefined
        }
        onConfirm={confirmDelete}
        onHide={() => setDeleteId(null)}
        isDeleting={mutations.remove.isPending}
      />
    </>
  );
}
