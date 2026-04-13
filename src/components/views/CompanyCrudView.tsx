"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CompanyImportModal } from "@/components/company/CompanyImportModal";
import { CompanyListTable } from "@/components/company/CompanyListTable";
import { DeleteConfirmationDialog } from "@/components/crud/DeleteConfirmationDialog";
import { FormField, FormModal } from "@/components/crud/FormModal";
import { ViewCompanyModal } from "@/components/company/ViewCompanyModal";
import { useCompany } from "@/hooks/company/useCompany";
import { useCompanyMutations } from "@/hooks/company/useCompanyMutations";
import { useCompanies } from "@/hooks/company/useCompanies";
import { usePermissions } from "@/hooks/permissions/usePermissions";
import { useVendors } from "@/hooks/vendors/useVendors";
import { extractListRows } from "@/lib/api/extractApiData";
import { resolveDeleteItemLabel } from "@/lib/crud/resolveDeleteItemLabel";
import { downloadCompanyImportTemplate } from "@/lib/company/downloadCompanyImportTemplate";
import {
  buildCompanyListSearchParams,
  parseCompanyListSearchParams,
  type CompanyListUrlState,
} from "@/lib/company/companyListUrl";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { companyProductPricingPath } from "@/lib/navigation/appPaths";
import { unwrapApiSuccessData } from "@/lib/dashboard/unwrapAnalyticsPayload";
import {
  showAppToast,
  showBillingBackendErrorToast,
} from "@/lib/toast/appToast";
import type { Company, IndexCompanyParams } from "@/models/Company";
import { ModuleName } from "@/models/Module";

const LIMIT_OPTIONS = [10, 20, 25, 50, 100] as const;

function rowKey(c: Company): string | number | null {
  if (c.id != null) return c.id;
  const t = c.tenant_id;
  if (t != null && String(t).trim() !== "") return String(t).trim();
  return null;
}

function productPricingUrl(tenantOrId: string | number): string {
  if (typeof window === "undefined") return "#";
  return `${window.location.origin}${companyProductPricingPath(String(tenantOrId))}`;
}

export function CompanyCrudView() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [listState, setListState] = useState<CompanyListUrlState>(() =>
    parseCompanyListSearchParams(searchParams),
  );

  const debouncedSearch = useDebouncedValue(listState.search, 300);

  useEffect(() => {
    const q = buildCompanyListSearchParams(listState, {
      searchOverride: debouncedSearch,
    });
    const next = q.toString();
    if (next === searchParams.toString()) return;
    router.replace(`${pathname}?${next}`, { scroll: false });
  }, [
    listState.page,
    listState.limit,
    listState.sort_field,
    listState.sort_direction,
    listState.tenant_id,
    listState.vendor_id,
    debouncedSearch,
    pathname,
    router,
    searchParams,
  ]);

  const {
    canView,
    canCreate,
    canUpdate,
    canDelete,
    isSuperAdmin,
    isUserLoading,
  } = usePermissions();
  const mod = ModuleName.COMPANY;
  const allowView = isSuperAdmin || canView(mod);
  const allowCreate = isSuperAdmin || canCreate(mod);
  const allowUpdate = isSuperAdmin || canUpdate(mod);
  const allowDelete = isSuperAdmin || canDelete(mod);

  const listParams = useMemo((): IndexCompanyParams => {
    const vendorRaw = listState.vendor_id.trim();
    const vendorNum = vendorRaw ? Number.parseInt(vendorRaw, 10) : NaN;
    return {
      page: listState.page,
      limit: listState.limit,
      load_profile: true,
      load_outstanding_amount: true,
      "order[column]": listState.sort_field,
      "order[dir]": listState.sort_direction,
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(listState.tenant_id.trim()
        ? { tenant_id: listState.tenant_id.trim() }
        : {}),
      ...(Number.isFinite(vendorNum) ? { vendor_id: vendorNum } : {}),
    };
  }, [
    listState.page,
    listState.limit,
    listState.sort_field,
    listState.sort_direction,
    listState.tenant_id,
    listState.vendor_id,
    debouncedSearch,
  ]);

  const listQuery = useCompanies(listParams, { enabled: allowView });
  const { pagination } = extractListRows(listQuery.data);

  const tenantPickerParams = useMemo((): IndexCompanyParams => {
    const vendorRaw = listState.vendor_id.trim();
    const vendorNum = vendorRaw ? Number.parseInt(vendorRaw, 10) : NaN;
    return {
      limit: 800,
      page: 1,
      ...(Number.isFinite(vendorNum) ? { vendor_id: vendorNum } : {}),
    };
  }, [listState.vendor_id]);

  const tenantsForPicker = useCompanies(tenantPickerParams, {
    enabled: allowView,
  });
  const tenantRows = extractListRows<Company & Record<string, unknown>>(
    tenantsForPicker.data,
  ).rows;

  const vendorsForPicker = useVendors(
    {
      limit: 500,
      "order[column]": "name",
      "order[dir]": "asc",
    },
    { enabled: allowView },
  );
  const vendorRows = extractListRows(vendorsForPicker.data).rows as {
    id: number;
    name: string;
  }[];

  const mutations = useCompanyMutations();
  const [detailKey, setDetailKey] = useState<number | string | null>(null);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  const deleteItemLabel = useMemo(
    () =>
      resolveDeleteItemLabel(listQuery.data, deleteId, {
        labelKeys: ["name", "tenant_id", "email"],
      }),
    [listQuery.data, deleteId],
  );

  const editQuery = useCompany(editId, { load_profile: true });

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

  function handleSort(field: string) {
    setListState((s) => {
      if (s.sort_field === field) {
        return {
          ...s,
          sort_direction: s.sort_direction === "asc" ? "desc" : "asc",
          page: 1,
        };
      }
      return {
        ...s,
        sort_field: field,
        sort_direction: "asc",
        page: 1,
      };
    });
  }

  async function handleDownloadTemplate() {
    setTemplateLoading(true);
    try {
      await downloadCompanyImportTemplate();
      showAppToast("Template downloaded.", "success");
    } catch (err) {
      showBillingBackendErrorToast(err);
      const headers = [
        "name",
        "email",
        "phone",
        "address",
        "payment_mode",
        "payment_terms",
        "credit_limit",
        "discount_type",
        "discount_limit",
        "early_payment_discount",
        "late_fee_rule",
        "currency",
        "vat_rate",
        "vat_exemption",
        "tax_id",
        "vendor_name",
      ];
      const csvContent =
        `${headers.join(",")}\n` +
        "Company Name,company@example.com,+1234567890,123 Main St,one_time,30,10000.00,flat_percentage,15.00,2.00,5.00,USD,20.00,false,TAX123456,Vendor Name";
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "company_import_template.csv";
      a.click();
      URL.revokeObjectURL(url);
      showAppToast("Used local fallback template.", "info");
    } finally {
      setTemplateLoading(false);
    }
  }

  async function handleImportFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    await mutations.importCsv.mutateAsync(fd);
    showAppToast("Import completed.", "success");
  }

  function openProductPricing(c: Company) {
    const key = c.tenant_id ?? c.id;
    if (key == null || key === "") {
      showAppToast("No tenant or id for pricing link.", "warning");
      return;
    }
    window.open(productPricingUrl(key), "_blank", "noopener,noreferrer");
  }

  if (isUserLoading) {
    return (
      <div className="h-40 animate-pulse rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60" />
    );
  }

  if (!allowView) {
    return (
      <p
        className="rounded-2xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
        role="status"
      >
        You do not have permission to view companies.
      </p>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Tenants
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-900 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100"
          >
            Import
          </button>
          <button
            type="button"
            onClick={() => void handleDownloadTemplate()}
            disabled={templateLoading}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {templateLoading ? "Template…" : "Template"}
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          List filters — GET /company
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Search
            </label>
            <input
              type="search"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={listState.search}
              onChange={(e) =>
                setListState((s) => ({
                  ...s,
                  search: e.target.value,
                  page: 1,
                }))
              }
              placeholder="Search email or phone…"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Filter by tenant
            </label>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={listState.tenant_id}
              onChange={(e) =>
                setListState((s) => ({
                  ...s,
                  tenant_id: e.target.value,
                  page: 1,
                }))
              }
            >
              <option value="">All tenants</option>
              {tenantRows.map((t) => {
                const tid =
                  t.tenant_id != null ? String(t.tenant_id) : "";
                const label =
                  (t.name && String(t.name)) ||
                  tid ||
                  (t.id != null ? `ID ${t.id}` : "—");
                if (!tid && t.id == null) return null;
                return (
                  <option
                    key={`${tid || t.id}`}
                    value={tid || String(t.id)}
                  >
                    {label}
                    {tid ? ` (${tid})` : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Filter by vendor
            </label>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={listState.vendor_id}
              onChange={(e) => {
                const v = e.target.value;
                setListState((s) => ({
                  ...s,
                  vendor_id: v,
                  tenant_id: v ? "" : s.tenant_id,
                  page: 1,
                }));
              }}
            >
              <option value="">All vendors</option>
              {vendorRows.map((v) => (
                <option key={v.id} value={String(v.id)}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Page size
            </label>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={listState.limit}
              onChange={(e) =>
                setListState((s) => ({
                  ...s,
                  limit: Number(e.target.value),
                  page: 1,
                }))
              }
            >
              {LIMIT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <CompanyListTable
        query={listQuery}
        title="Companies"
        sortField={listState.sort_field}
        sortDir={listState.sort_direction}
        onSort={handleSort}
        pagination={pagination}
        onPageChange={(page) => setListState((s) => ({ ...s, page }))}
        canView={allowView}
        canCreate={allowCreate}
        canUpdate={allowUpdate}
        canDelete={allowDelete}
        onCreate={openCreate}
        onView={(c) => {
          const k = rowKey(c);
          if (k != null) setDetailKey(k);
        }}
        onEdit={(c) => {
          const k = rowKey(c);
          if (k == null) {
            showAppToast("Row has no id or tenant_id to edit.", "warning");
            return;
          }
          setEditId(k);
          setFormOpen(true);
        }}
        onDelete={(c) => {
          const k = rowKey(c);
          if (k == null) {
            showAppToast("Row has no id or tenant_id to delete.", "warning");
            return;
          }
          setDeleteId(k);
        }}
        onProductPricing={openProductPricing}
      />

      <CompanyImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        isPending={mutations.importCsv.isPending}
        onImport={handleImportFile}
      />

      <ViewCompanyModal
        show={detailKey != null}
        onHide={() => setDetailKey(null)}
        companyId={detailKey}
        onEdit={
          allowUpdate
            ? (company) => {
                const k = rowKey(company);
                if (k == null) {
                  showAppToast(
                    "Row has no id or tenant_id to edit.",
                    "warning",
                  );
                  return;
                }
                setEditId(k);
                setFormOpen(true);
              }
            : undefined
        }
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

      <DeleteConfirmationDialog
        show={deleteId != null && deleteId !== ""}
        title="Delete company?"
        message="Deletes via DELETE /company/delete/{id}. This may fail if dependencies exist."
        itemName={deleteItemLabel}
        onConfirm={confirmDelete}
        onHide={() => setDeleteId(null)}
        isDeleting={mutations.remove.isPending}
      />
    </>
  );
}
