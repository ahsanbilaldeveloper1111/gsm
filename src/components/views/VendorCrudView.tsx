"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudEntityTable } from "@/components/crud/CrudEntityTable";
import { FormField, FormModal } from "@/components/crud/FormModal";
import { RecordDetailModal } from "@/components/crud/RecordDetailModal";
import { useVendor } from "@/hooks/vendors/useVendor";
import { useVendorMutations } from "@/hooks/vendors/useVendorMutations";
import { useVendors } from "@/hooks/vendors/useVendors";
import { unwrapApiSuccessData } from "@/lib/dashboard/unwrapAnalyticsPayload";
import {
  showAppToast,
  showBillingBackendErrorToast,
} from "@/lib/toast/appToast";

export function VendorCrudView() {
  const listQuery = useVendors();
  const mutations = useVendorMutations();
  const [detailId, setDetailId] = useState<number | string | null>(null);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  const detailQuery = useVendor(detailId, { load_profile: true });
  const editQuery = useVendor(editId, { load_profile: true });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (!formOpen) return;
    if (editId == null) {
      setName("");
      setEmail("");
      setPhone("");
      setStatus("active");
      return;
    }
    const raw = unwrapApiSuccessData<Record<string, unknown>>(editQuery.data);
    if (!raw) return;
    setName(String(raw.name ?? ""));
    setEmail(String(raw.email ?? ""));
    setPhone(String(raw.phone ?? ""));
    setStatus(String(raw.status ?? "active"));
  }, [formOpen, editId, editQuery.data]);

  const openCreate = () => {
    setEditId(null);
    setFormOpen(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = {
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      status: status.trim() || undefined,
    };
    try {
      if (editId == null) {
        await mutations.create.mutateAsync(body);
        showAppToast("Vendor created.", "success");
      } else {
        await mutations.update.mutateAsync({ id: editId, body });
        showAppToast("Vendor updated.", "success");
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
      showAppToast("Vendor deleted.", "success");
      setDeleteId(null);
    } catch (err) {
      showBillingBackendErrorToast(err);
    }
  }

  return (
    <>
      <CrudEntityTable
        query={listQuery}
        title="Vendors"
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
        title="Vendor"
        subtitle="Profile and related fields from the API."
        data={detailQuery.data ?? null}
        loading={detailQuery.isPending && detailId != null}
        error={
          detailQuery.isError ? String(detailQuery.error) : null
        }
        onClose={() => setDetailId(null)}
      />

      <FormModal
        open={formOpen}
        title={editId == null ? "New vendor" : "Edit vendor"}
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
        <FormField label="Email">
          <input
            type="email"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
        </FormField>
        <FormField label="Phone">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={phone}
            onChange={(ev) => setPhone(ev.target.value)}
          />
        </FormField>
        <FormField label="Status">
          <select
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={status}
            onChange={(ev) => setStatus(ev.target.value)}
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="pending">pending</option>
            <option value="suspended">suspended</option>
          </select>
        </FormField>
      </FormModal>

      <ConfirmDialog
        open={deleteId != null}
        title="Delete vendor?"
        message="This cannot be undone. The API may reject the delete if the vendor is in use."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={mutations.remove.isPending}
      />
    </>
  );
}
