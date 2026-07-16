"use client";

import { useMemo, useState } from "react";
import {
  FilterPanel,
  filterFieldLabelClassName,
  filterSelectControlClassName,
  filterTextControlClassName,
} from "@/components/ui/FilterPanel";
import { PaginatedDataTable } from "@/components/ui/PaginatedDataTable";
import { CompanySearchableDropdown } from "@/components/ui/CompanySearchableDropdown";
import { useCompanies } from "@/hooks/company/useCompanies";
import { useGsm } from "@/hooks/gsm/useGsm";
import { useSimMutations, useSims } from "@/hooks/sims/useSims";
import {
  deriveTotalsFromTelecomPagination,
  gsmDropdownListParams,
  useClampPageToLastPage,
} from "@/lib/pagination/serverPagination";
import { showAppToast, showBillingBackendErrorToast } from "@/lib/toast/appToast";
import type { IndexSimParams, Sim } from "@/models/Sim";

type SimForm = {
  sim_number: string;
  iccid: string;
  gsm_id: string;
  company_id: string;
  status: "active" | "inactive";
};

const emptyForm: SimForm = {
  sim_number: "",
  iccid: "",
  gsm_id: "",
  company_id: "",
  status: "active",
};

function extractRows(data: unknown): Array<Record<string, unknown>> {
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.data)) return obj.data as Array<Record<string, unknown>>;
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    const nested = obj.data as Record<string, unknown>;
    if (Array.isArray(nested.data)) return nested.data as Array<Record<string, unknown>>;
  }
  return [];
}

export function SimManagementView() {
  const [filtersDraft, setFiltersDraft] = useState({
    gsm_id: "",
    company_id: "",
    sim_number: "",
    iccid: "",
    status: "",
  });
  const [filters, setFilters] = useState(filtersDraft);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [addForm, setAddForm] = useState<SimForm>(emptyForm);
  const [editForm, setEditForm] = useState<SimForm>(emptyForm);

  const listParams: IndexSimParams = useMemo(
    () => ({
      gsm_id: filters.gsm_id || undefined,
      company_id: filters.company_id || undefined,
      sim_number: filters.sim_number || undefined,
      iccid: filters.iccid || undefined,
      status: filters.status || undefined,
      page,
      perPage,
    }),
    [filters, page, perPage],
  );
  const simsQuery = useSims(listParams);
  const gsmQuery = useGsm(gsmDropdownListParams);
  const companiesQuery = useCompanies();
  const { create, update, destroy } = useSimMutations();

  const simRows = simsQuery.data?.rows ?? [];
  const pagination = simsQuery.data?.pagination;
  const { totalRows, totalPages } = deriveTotalsFromTelecomPagination(
    pagination,
    simRows.length,
    perPage,
  );
  useClampPageToLastPage(pagination?.last_page, page, setPage);
  const gsmRows = gsmQuery.data?.rows ?? [];
  const companyRows = useMemo(
    () => extractRows(companiesQuery.data),
    [companiesQuery.data],
  );
  const columns = useMemo(
    () => [
      { key: "id", header: "ID", render: (row: Sim) => String(row.id ?? "-") },
      { key: "sim_number", header: "Sim Number", render: (row: Sim) => String(row.sim_number ?? "-") },
      { key: "iccid", header: "ICCID Number", render: (row: Sim) => String(row.iccid ?? "-") },
      {
        key: "status",
        header: "Status",
        render: (row: Sim) =>
          String(row.status ?? "").toLowerCase() === "active" ? (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Active</span>
          ) : (
            <span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-700">Inactive</span>
          ),
      },
      {
        key: "created_at",
        header: "Created At",
        render: (row: Sim) =>
          row.created_at ? new Date(String(row.created_at)).toLocaleString() : "-",
      },
      {
        key: "actions",
        header: "Actions",
        render: (row: Sim) => (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg bg-zinc-900 px-2 py-1 text-xs font-medium text-white dark:bg-emerald-600"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => row.id != null && onDelete(row.id)}
              className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-medium text-white"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  function onApplyFilters() {
    setFilters({ ...filtersDraft });
    setPage(1);
  }

  function openEdit(row: Sim) {
    setEditId(row.id ?? null);
    setEditForm({
      sim_number: String(row.sim_number ?? ""),
      iccid: String(row.iccid ?? ""),
      gsm_id: String(row.gsm_id ?? ""),
      company_id: String(row.company_id ?? ""),
      status: row.status === "inactive" ? "inactive" : "active",
    });
    setShowEdit(true);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({
        sim_number: addForm.sim_number.trim(),
        iccid: addForm.iccid.trim(),
        gsm_id: addForm.gsm_id || undefined,
        company_id: addForm.company_id || undefined,
      });
      setShowAdd(false);
      setAddForm(emptyForm);
      showAppToast("SIM created successfully!", "success");
    } catch (error) {
      showBillingBackendErrorToast(error);
    }
  }

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (editId == null) return;
    try {
      await update.mutateAsync({
        id: editId,
        payload: {
          sim_number: editForm.sim_number.trim(),
          iccid: editForm.iccid.trim(),
          gsm_id: editForm.gsm_id || undefined,
          company_id: editForm.company_id || undefined,
          status: editForm.status,
        },
      });
      setShowEdit(false);
      setEditId(null);
      showAppToast("SIM updated successfully!", "success");
    } catch (error) {
      showBillingBackendErrorToast(error);
    }
  }

  async function onDelete(id: number | string) {
    if (!window.confirm("Delete this SIM?")) return;
    try {
      await destroy.mutateAsync(id);
      showAppToast("SIM deleted successfully!", "success");
    } catch (error) {
      showBillingBackendErrorToast(error);
    }
  }

  return (
    <div className="space-y-4">
      <FilterPanel
        primaryAction={{
          label: "Apply filters",
          onClick: onApplyFilters,
        }}
      >
        <FilterSelect
          label="Select GSM"
          value={filtersDraft.gsm_id}
          onChange={(v) => setFiltersDraft((s) => ({ ...s, gsm_id: v }))}
          options={[{ value: "", label: "All" }].concat(
            gsmRows.map((g, idx) => ({
              value: String(g.id ?? ""),
              label: String(g.name ?? `GSM ${g.id ?? idx}`),
            })),
          )}
        />
        <div>
          <label className={filterFieldLabelClassName}>Select Company</label>
          <CompanySearchableDropdown
            value={filtersDraft.company_id}
            onChange={(v) => setFiltersDraft((s) => ({ ...s, company_id: v }))}
            rows={companyRows}
            placeholder="All"
            listClearLabel="All"
            selectLike
            controlClassName={filterSelectControlClassName}
            ariaLabel="Select Company"
          />
        </div>
        <FilterInput
          label="Sim Number"
          value={filtersDraft.sim_number}
          onChange={(v) => setFiltersDraft((s) => ({ ...s, sim_number: v }))}
          placeholder="Sim Number"
        />
        <FilterInput
          label="ICCID Number"
          value={filtersDraft.iccid}
          onChange={(v) => setFiltersDraft((s) => ({ ...s, iccid: v }))}
          placeholder="ICCID Number"
        />
        <FilterSelect
          label="Status"
          value={filtersDraft.status}
          onChange={(v) => setFiltersDraft((s) => ({ ...s, status: v }))}
          options={[
            { value: "", label: "All" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </FilterPanel>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
            Details
          </h4>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-emerald-600"
          >
            + Add SIM
          </button>
        </div>

        <PaginatedDataTable
          columns={columns}
          rows={simRows}
          isLoading={simsQuery.isPending}
          emptyMessage="No SIM records found"
          minWidthClassName="min-w-[60rem]"
          initialPerPage={10}
          paginationMode="server"
          page={page}
          totalPages={totalPages}
          totalRows={totalRows}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(next) => {
            setPerPage(next);
            setPage(1);
          }}
          getRowKey={(row, idx) => String(row.id ?? idx)}
        />
      </div>

      <SimFormModal
        open={showAdd}
        title="Add Sim"
        submitLabel="Create"
        form={addForm}
        gsmRows={gsmRows}
        companyRows={companyRows}
        onClose={() => setShowAdd(false)}
        onChange={setAddForm}
        onSubmit={onCreate}
      />

      <SimFormModal
        open={showEdit}
        title="Edit Sim"
        submitLabel="Update"
        form={editForm}
        gsmRows={gsmRows}
        companyRows={companyRows}
        onClose={() => setShowEdit(false)}
        onChange={setEditForm}
        onSubmit={onUpdate}
        includeStatus
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <label className={filterFieldLabelClassName}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={filterSelectControlClassName}
      >
        {options.map((o) => (
          <option key={`${o.value}-${o.label}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className={filterFieldLabelClassName}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={filterTextControlClassName}
      />
    </div>
  );
}

function SimFormModal({
  open,
  title,
  submitLabel,
  form,
  gsmRows,
  companyRows,
  onClose,
  onChange,
  onSubmit,
  includeStatus = false,
}: {
  open: boolean;
  title: string;
  submitLabel: string;
  form: SimForm;
  gsmRows: Array<{ id?: number | string; name?: string }>;
  companyRows: Array<Record<string, unknown>>;
  onClose: () => void;
  onChange: (form: SimForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  includeStatus?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h4 className="mb-3 text-lg font-semibold">{title}</h4>
        <div className="space-y-2">
          <FilterSelect
            label="Select GSM"
            value={form.gsm_id}
            onChange={(value) => onChange({ ...form, gsm_id: value })}
            options={[{ value: "", label: "Select GSM" }].concat(
              gsmRows.map((g, idx) => ({
                value: String(g.id ?? ""),
                label: String(g.name ?? `GSM ${idx + 1}`),
              })),
            )}
          />
          <div>
            <label className={filterFieldLabelClassName}>Select Company</label>
            <CompanySearchableDropdown
              value={form.company_id}
              onChange={(value) => onChange({ ...form, company_id: value })}
              rows={companyRows}
              placeholder="Select Company"
              listClearLabel="Select Company"
              selectLike
              controlClassName={filterSelectControlClassName}
              ariaLabel="Select Company"
            />
          </div>
          <FilterInput
            label="Sim Number"
            value={form.sim_number}
            onChange={(value) => onChange({ ...form, sim_number: value })}
            placeholder="Sim Number"
          />
          <FilterInput
            label="ICCID Number"
            value={form.iccid}
            onChange={(value) => onChange({ ...form, iccid: value })}
            placeholder="ICCID Number"
          />
          {includeStatus ? (
            <FilterSelect
              label="Status"
              value={form.status}
              onChange={(value) =>
                onChange({
                  ...form,
                  status: value === "inactive" ? "inactive" : "active",
                })
              }
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          ) : null}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-emerald-600"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
