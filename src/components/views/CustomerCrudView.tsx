"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/crud/ConfirmDialog";
import { CrudEntityTable } from "@/components/crud/CrudEntityTable";
import { FormField, FormModal } from "@/components/crud/FormModal";
import { RecordDetailModal } from "@/components/crud/RecordDetailModal";
import { useCustomer } from "@/hooks/customers/useCustomer";
import { useCustomerMutations } from "@/hooks/customers/useCustomerMutations";
import { useCustomers } from "@/hooks/customers/useCustomers";
import { unwrapApiSuccessData } from "@/lib/dashboard/unwrapAnalyticsPayload";
import {
  showAppToast,
  showBillingBackendErrorToast,
} from "@/lib/toast/appToast";
import type { CreateCustomerData, Customer } from "@/models/Customer";

const detailParams = { load_profile: true } as const;

export function CustomerCrudView() {
  const listQuery = useCustomers();
  const mutations = useCustomerMutations();
  const [detailId, setDetailId] = useState<number | string | null>(null);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  const detailQuery = useCustomer(detailId, detailParams);
  const editQuery = useCustomer(editId, detailParams);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [crmCompanyId, setCrmCompanyId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [currency, setCurrency] = useState("");

  useEffect(() => {
    if (!formOpen) return;
    if (editId == null) {
      setName("");
      setEmail("");
      setPhone("");
      setCrmCompanyId("");
      setTenantId("");
      setAddress("");
      setCity("");
      setCountry("");
      setPostalCode("");
      setCurrency("");
      return;
    }
    const raw = unwrapApiSuccessData<Customer>(editQuery.data);
    if (!raw) return;
    setName(raw.name ?? "");
    setEmail(raw.email ?? "");
    setPhone(raw.phone ?? "");
    setCrmCompanyId(raw.crm_company_id ?? "");
    setTenantId(raw.tenant_id ?? "");
    const p = raw.profile;
    setAddress(p?.address ?? "");
    setCity(p?.city ?? "");
    setCountry(p?.country ?? "");
    setPostalCode(p?.postal_code ?? "");
    setCurrency(p?.currency ?? "");
  }, [formOpen, editId, editQuery.data]);

  const openCreate = () => {
    setEditId(null);
    setFormOpen(true);
  };

  function buildBody(): CreateCustomerData {
    const hasProfile =
      !!address.trim() ||
      !!city.trim() ||
      !!country.trim() ||
      !!postalCode.trim() ||
      !!currency.trim();
    const profile = hasProfile
      ? {
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim() || undefined,
          postal_code: postalCode.trim() || undefined,
          currency: currency.trim() || undefined,
        }
      : undefined;
    return {
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      crm_company_id: crmCompanyId.trim() || null,
      tenant_id: tenantId.trim() || null,
      profile,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editId == null) {
        await mutations.create.mutateAsync(buildBody());
        showAppToast("Customer created.", "success");
      } else {
        await mutations.update.mutateAsync({
          id: editId,
          body: buildBody(),
        });
        showAppToast("Customer updated.", "success");
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
      showAppToast("Customer deleted.", "success");
      setDeleteId(null);
    } catch (err) {
      showBillingBackendErrorToast(err);
    }
  }

  return (
    <>
      <CrudEntityTable
        query={listQuery}
        title="Customers"
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
        title="Customer"
        subtitle="Customer record (GET /customers/{id}) with profile when available."
        data={detailQuery.data ?? null}
        loading={detailQuery.isPending && detailId != null}
        error={detailQuery.isError ? String(detailQuery.error) : null}
        onClose={() => setDetailId(null)}
      />

      <FormModal
        open={formOpen}
        title={editId == null ? "New customer" : "Edit customer"}
        onClose={() => {
          setFormOpen(false);
          setEditId(null);
        }}
        onSubmit={handleSubmit}
        loading={mutations.create.isPending || mutations.update.isPending}
      >
        <FormField label="Name">
          <input
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
        <FormField label="CRM company ID">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={crmCompanyId}
            onChange={(ev) => setCrmCompanyId(ev.target.value)}
            placeholder="Optional"
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
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Profile (optional)
        </p>
        <FormField label="Address">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={address}
            onChange={(ev) => setAddress(ev.target.value)}
          />
        </FormField>
        <FormField label="City">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={city}
            onChange={(ev) => setCity(ev.target.value)}
          />
        </FormField>
        <FormField label="Country">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={country}
            onChange={(ev) => setCountry(ev.target.value)}
          />
        </FormField>
        <FormField label="Postal code">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={postalCode}
            onChange={(ev) => setPostalCode(ev.target.value)}
          />
        </FormField>
        <FormField label="Currency">
          <input
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={currency}
            onChange={(ev) => setCurrency(ev.target.value)}
            placeholder="e.g. USD"
          />
        </FormField>
      </FormModal>

      <ConfirmDialog
        open={deleteId != null}
        title="Delete customer?"
        message="Deletes via DELETE /customers/{customer}. This may fail if invoices or other records reference this customer."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={mutations.remove.isPending}
      />
    </>
  );
}
