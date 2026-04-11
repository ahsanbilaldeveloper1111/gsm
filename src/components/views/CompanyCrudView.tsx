"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudEntityTable } from "@/components/crud/CrudEntityTable";
import { FormField, FormModal } from "@/components/crud/FormModal";
import { RecordDetailModal } from "@/components/crud/RecordDetailModal";
import { useCompany } from "@/hooks/company/useCompany";
import { useCompanyMutations } from "@/hooks/company/useCompanyMutations";
import { useCompanies } from "@/hooks/company/useCompanies";
import { unwrapApiSuccessData } from "@/lib/dashboard/unwrapAnalyticsPayload";
import {
  showAppToast,
  showBillingBackendErrorToast,
} from "@/lib/toast/appToast";

export function CompanyCrudView() {
  const listQuery = useCompanies();
  const mutations = useCompanyMutations();
  const [detailId, setDetailId] = useState<number | string | null>(null);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  const detailQuery = useCompany(detailId);
  const editQuery = useCompany(editId);

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [vendorId, setVendorId] = useState("");

  useEffect(() => {
    if (!formOpen) return;
    if (editId == null) {
      setUsername("");
      setName("");
      setEmail("");
      setPhone("");
      setTenantId("");
      setVendorId("");
      return;
    }
    const raw = unwrapApiSuccessData<Record<string, unknown>>(editQuery.data);
    if (!raw) return;
    setUsername(String(raw.username ?? ""));
    setName(String(raw.name ?? ""));
    setEmail(String(raw.email ?? ""));
    setPhone(String(raw.phone ?? raw.phone_no ?? ""));
    setTenantId(raw.tenant_id != null ? String(raw.tenant_id) : "");
    setVendorId(raw.vendor_id != null ? String(raw.vendor_id) : "");
  }, [formOpen, editId, editQuery.data]);

  const openCreate = () => {
    setEditId(null);
    setFormOpen(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = {
      username: username.trim(),
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    };
    if (tenantId.trim()) body.tenant_id = tenantId.trim();
    if (vendorId.trim()) {
      const n = Number.parseInt(vendorId, 10);
      if (Number.isFinite(n)) body.vendor_id = n;
    }
    if (editId != null) {
      const n = Number(editId);
      if (Number.isFinite(n)) body.id = n;
    }
    try {
      await mutations.createUpdate.mutateAsync(body);
      showAppToast(editId == null ? "Company created." : "Company saved.", "success");
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
      showAppToast("Company deleted.", "success");
      setDeleteId(null);
    } catch (err) {
      showBillingBackendErrorToast(err);
    }
  }

  return (
    <>
      <CrudEntityTable
        query={listQuery}
        title="Companies"
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
        title="Company"
        subtitle="Tenant / company record from GET /company/{id}."
        data={detailQuery.data ?? null}
        loading={detailQuery.isPending && detailId != null}
        error={detailQuery.isError ? String(detailQuery.error) : null}
        onClose={() => setDetailId(null)}
      />

      <FormModal
        open={formOpen}
        title={editId == null ? "New company" : "Edit company"}
        onClose={() => {
          setFormOpen(false);
          setEditId(null);
        }}
        onSubmit={handleSubmit}
        loading={mutations.createUpdate.isPending}
      >
        <FormField label="Username">
          <input
            required
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
          />
        </FormField>
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
        <FormField label="Tenant ID">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={tenantId}
            onChange={(ev) => setTenantId(ev.target.value)}
            placeholder="Optional"
          />
        </FormField>
        <FormField label="Vendor ID">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={vendorId}
            onChange={(ev) => setVendorId(ev.target.value)}
            placeholder="Optional numeric"
          />
        </FormField>
      </FormModal>

      <ConfirmDialog
        open={deleteId != null}
        title="Delete company?"
        message="Deletes via DELETE /company/delete/{id}. This may fail if dependencies exist."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={mutations.remove.isPending}
      />
    </>
  );
}
