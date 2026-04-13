"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CreateUpdateCustomerModal } from "@/components/customers/CreateUpdateCustomerModal";
import { CustomerListTable } from "@/components/customers/CustomerListTable";
import { ViewCustomerModal } from "@/components/customers/ViewCustomerModal";
import { DeleteConfirmationDialog } from "@/components/crud/DeleteConfirmationDialog";
import { useCompanies } from "@/hooks/company/useCompanies";
import { useTenantDisplayNameMap } from "@/hooks/company/useTenantDisplayNameMap";
import { useCustomerMutations } from "@/hooks/customers/useCustomerMutations";
import { useCustomers } from "@/hooks/customers/useCustomers";
import { usePermissions } from "@/hooks/permissions/usePermissions";
import { useVendors } from "@/hooks/vendors/useVendors";
import { extractListRows } from "@/lib/api/extractApiData";
import {
  buildCustomerListSearchParams,
  parseCustomerListSearchParams,
  type CustomerListUrlState,
} from "@/lib/customers/customerListUrl";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { appPaths, customerProductPricingPath } from "@/lib/navigation/appPaths";
import {
  showAppToast,
  showBillingBackendErrorToast,
} from "@/lib/toast/appToast";
import type { Company, IndexCompanyParams } from "@/models/Company";
import type { Customer, IndexCustomerParams } from "@/models/Customer";

const LIMIT_OPTIONS = [10, 20, 25, 50, 100] as const;

function customerRowKey(c: Customer): string | number {
  const crm = c.crm_company_id;
  if (crm != null && String(crm).trim() !== "") return String(crm).trim();
  return c.id;
}

function productPricingUrl(customerKey: string | number): string {
  if (typeof window === "undefined") return "#";
  return `${window.location.origin}${customerProductPricingPath(String(customerKey))}`;
}

export function CustomerCrudView() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [listState, setListState] = useState<CustomerListUrlState>(() =>
    parseCustomerListSearchParams(searchParams),
  );

  const debouncedSearch = useDebouncedValue(listState.search, 300);

  useEffect(() => {
    const q = buildCustomerListSearchParams(listState, {
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
    listState.crm_company_id,
    listState.vendor_id,
    debouncedSearch,
    pathname,
    router,
    searchParams,
  ]);

  const { isSuperAdmin, isUserLoading } = usePermissions();

  useEffect(() => {
    if (isUserLoading || isSuperAdmin) return;
    router.replace(appPaths.invoices, { scroll: false });
  }, [isUserLoading, isSuperAdmin, router]);

  const tenantNameMap = useTenantDisplayNameMap();

  const listParams = useMemo((): IndexCustomerParams => {
    const vendorRaw = listState.vendor_id.trim();
    const vendorNum = vendorRaw ? Number.parseInt(vendorRaw, 10) : NaN;
    return {
      page: listState.page,
      limit: listState.limit,
      load_profile: true,
      load_invoices_count: true,
      "order[column]": listState.sort_field,
      "order[dir]": listState.sort_direction,
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(listState.tenant_id.trim()
        ? { tenant_id: listState.tenant_id.trim() }
        : {}),
      ...(listState.crm_company_id.trim()
        ? { crm_company_id: listState.crm_company_id.trim() }
        : {}),
      ...(Number.isFinite(vendorNum) ? { vendor_id: vendorNum } : {}),
    };
  }, [
    listState.page,
    listState.limit,
    listState.sort_field,
    listState.sort_direction,
    listState.tenant_id,
    listState.crm_company_id,
    listState.vendor_id,
    debouncedSearch,
  ]);

  const listQuery = useCustomers(listParams, {
    enabled: isSuperAdmin && !isUserLoading,
  });
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
    enabled: isSuperAdmin && !isUserLoading,
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
    { enabled: isSuperAdmin && !isUserLoading },
  );
  const vendorRows = extractListRows(vendorsForPicker.data).rows as {
    id: number;
    name: string;
  }[];

  const customerPickerParams = useMemo((): IndexCustomerParams => {
    const tenant = listState.tenant_id.trim();
    return {
      page: 1,
      limit: 500,
      tenant_id: tenant,
      load_profile: false,
      load_invoices_count: false,
      "order[column]": "name",
      "order[dir]": "asc",
    };
  }, [listState.tenant_id]);

  const customersForPicker = useCustomers(customerPickerParams, {
    enabled:
      isSuperAdmin &&
      !isUserLoading &&
      listState.tenant_id.trim().length > 0,
  });
  const customerPickerRows = extractListRows<Customer & Record<string, unknown>>(
    customersForPicker.data,
  ).rows;

  const mutations = useCustomerMutations();
  const [viewCustomerId, setViewCustomerId] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  const deleteItemLabel = useMemo(() => {
    if (deleteId == null) return undefined;
    const { rows } = extractListRows<Customer & Record<string, unknown>>(
      listQuery.data,
    );
    const row = rows.find((r) => {
      const crm = r.crm_company_id;
      const id = r.id;
      return (
        (crm != null && String(crm) === String(deleteId)) ||
        String(id) === String(deleteId)
      );
    });
    if (!row) return undefined;
    const n = row.name;
    if (typeof n === "string" && n.trim()) return n.trim();
    const e = row.email;
    if (typeof e === "string" && e.trim()) return e.trim();
    const c = row.crm_company_id;
    if (c != null && String(c).trim()) return String(c).trim();
    return undefined;
  }, [listQuery.data, deleteId]);

  const openCreate = () => {
    setEditId(null);
    setFormOpen(true);
  };

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

  function openProductPricing(c: Customer) {
    const key = customerRowKey(c);
    if (key == null || key === "") {
      showAppToast("No customer id for pricing link.", "warning");
      return;
    }
    window.open(productPricingUrl(key), "_blank", "noopener,noreferrer");
  }

  if (isUserLoading) {
    return (
      <div className="h-40 animate-pulse rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60" />
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Customers
        </h2>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          List filters — GET /customers
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
              placeholder="Search by name, email, phone…"
            />
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
                  crm_company_id: v ? "" : s.crm_company_id,
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
              Tenant
            </label>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={listState.tenant_id}
              onChange={(e) => {
                const tid = e.target.value;
                setListState((s) => ({
                  ...s,
                  tenant_id: tid,
                  crm_company_id: "",
                  page: 1,
                }));
              }}
            >
              <option value="">All tenants</option>
              {tenantRows.map((t) => {
                const tid =
                  t.tenant_id != null ? String(t.tenant_id) : "";
                const label =
                  (t.name && String(t.name)) ||
                  tenantNameMap[tid] ||
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
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Narrow the tenant list by selecting a vendor first.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Customer
            </label>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
              disabled={!listState.tenant_id.trim()}
              value={listState.crm_company_id}
              onChange={(e) =>
                setListState((s) => ({
                  ...s,
                  crm_company_id: e.target.value,
                  page: 1,
                }))
              }
            >
              <option value="">All customers</option>
              {customerPickerRows.map((c, idx) => {
                const val =
                  c.crm_company_id != null && String(c.crm_company_id).trim()
                    ? String(c.crm_company_id).trim()
                    : c.id != null
                      ? String(c.id)
                      : "";
                if (!val) return null;
                const lab =
                  (c.name && String(c.name).trim()) ||
                  val ||
                  `Row ${idx + 1}`;
                return (
                  <option key={`${val}-${idx}`} value={val}>
                    {lab}
                  </option>
                );
              })}
            </select>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Choose a tenant first to filter by CRM customer.
            </p>
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

      <CustomerListTable
        query={listQuery}
        title="Customers"
        sortField={listState.sort_field}
        sortDir={listState.sort_direction}
        onSort={handleSort}
        pagination={pagination}
        onPageChange={(page) => setListState((s) => ({ ...s, page }))}
        tenantNameMap={tenantNameMap}
        canView
        canCreate
        canUpdate
        canDelete
        onCreate={openCreate}
        onView={(c) =>
          setViewCustomerId(String(customerRowKey(c)))
        }
        onEdit={(c) => {
          setEditId(customerRowKey(c));
          setFormOpen(true);
        }}
        onDelete={(c) => setDeleteId(customerRowKey(c))}
        onProductPricing={openProductPricing}
      />

      <ViewCustomerModal
        show={viewCustomerId != null}
        onHide={() => setViewCustomerId(null)}
        customerId={viewCustomerId}
        onEdit={(customer) => {
          setEditId(customerRowKey(customer));
          setFormOpen(true);
        }}
      />

      <CreateUpdateCustomerModal
        open={formOpen}
        customerId={editId}
        onClose={() => {
          setFormOpen(false);
          setEditId(null);
        }}
        onSuccess={() => {
          void listQuery.refetch();
        }}
      />

      <DeleteConfirmationDialog
        show={deleteId != null && String(deleteId) !== ""}
        title="Delete customer?"
        message="Deletes via DELETE /customers/{customer}. This may fail if invoices or other records reference this customer."
        itemName={deleteItemLabel}
        onConfirm={confirmDelete}
        onHide={() => setDeleteId(null)}
        isDeleting={mutations.remove.isPending}
      />
    </>
  );
}
