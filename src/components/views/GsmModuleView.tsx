"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanies } from "@/hooks/company/useCompanies";
import { useGsm } from "@/hooks/gsm/useGsm";
import { queryKeys } from "@/lib/queryKeys";
import { showAppToast, showBillingBackendErrorToast } from "@/lib/toast/appToast";
import type { CreateGsmPayload, GsmDevice, UpdateGsmPayload } from "@/models/Gsm";
import { gsmService } from "@/services/gsm.service";
import { PaginatedDataTable } from "@/components/ui/PaginatedDataTable";

type GsmForm = {
  name: string;
  ip_address: string;
  username: string;
  password: string;
  status: "active" | "inactive";
};

const emptyForm: GsmForm = {
  name: "",
  ip_address: "",
  username: "",
  password: "",
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

function formatDate(input?: string): string {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleString("en-GB");
}

export function GsmModuleView() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState({
    ip_address: "",
    name: "",
    status: "",
    device_status: "",
  });
  const [filters, setFilters] = useState(draft);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [assignGsmId, setAssignGsmId] = useState<number | string | null>(null);
  const [assignCompanyId, setAssignCompanyId] = useState<string>("");
  const [addForm, setAddForm] = useState<GsmForm>(emptyForm);
  const [editForm, setEditForm] = useState<GsmForm>(emptyForm);

  const gsmQuery = useGsm(filters);
  const companiesQuery = useCompanies();
  const rows = gsmQuery.data?.rows ?? [];
  const companyRows = useMemo(() => extractRows(companiesQuery.data), [companiesQuery.data]);

  const refreshGsm = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.gsm.all });

  const createMutation = useMutation({
    mutationFn: (payload: CreateGsmPayload) => gsmService.create(payload),
    onSuccess: async () => {
      await refreshGsm();
      setShowAdd(false);
      setAddForm(emptyForm);
      showAppToast("GSM created successfully!", "success");
    },
    onError: showBillingBackendErrorToast,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateGsmPayload }) =>
      gsmService.update(id, payload),
    onSuccess: async () => {
      await refreshGsm();
      setShowEdit(false);
      setEditId(null);
      showAppToast("GSM updated successfully!", "success");
    },
    onError: showBillingBackendErrorToast,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => gsmService.destroy(id),
    onSuccess: async () => {
      await refreshGsm();
      showAppToast("GSM deleted successfully!", "success");
    },
    onError: showBillingBackendErrorToast,
  });

  const assignMutation = useMutation({
    mutationFn: ({ gsmId, companyId }: { gsmId: number | string; companyId: number | string }) =>
      gsmService.assignCompany(gsmId, companyId),
    onSuccess: async () => {
      await refreshGsm();
      setShowAssign(false);
      setAssignGsmId(null);
      setAssignCompanyId("");
      showAppToast("Company assigned successfully!", "success");
    },
    onError: showBillingBackendErrorToast,
  });

  function openEdit(row: GsmDevice) {
    const id = row.id ?? null;
    if (id == null) return;
    setEditId(id);
    setEditForm({
      name: String(row.name ?? ""),
      ip_address: String(row.ip_address ?? ""),
      username: String(row.username ?? ""),
      password: String(row.password ?? ""),
      status: String(row.status ?? "").toLowerCase() === "inactive" ? "inactive" : "active",
    });
    setShowEdit(true);
  }

  function openAssign(id: number | string) {
    setAssignGsmId(id);
    setAssignCompanyId("");
    setShowAssign(true);
  }

  const columns = useMemo(
    () => [
      { key: "id", header: "ID", render: (row: GsmDevice) => String(row.id ?? "-") },
      { key: "ip", header: "IP Address", render: (row: GsmDevice) => String(row.ip_address ?? "-") },
      { key: "name", header: "Name", render: (row: GsmDevice) => String(row.name ?? "-") },
      { key: "username", header: "Username", render: (row: GsmDevice) => String(row.username ?? "-") },
      {
        key: "device_status",
        header: "Device Status",
        render: (row: GsmDevice) =>
          String(row.device_status ?? "") === "power_on" ? (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Power On</span>
          ) : String(row.device_status ?? "") === "power_off" ? (
            <span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-700">Power Off</span>
          ) : (
            ""
          ),
      },
      {
        key: "status",
        header: "Status",
        render: (row: GsmDevice) =>
          String(row.status ?? "") === "active" ? (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Active</span>
          ) : (
            <span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-700">Inactive</span>
          ),
      },
      {
        key: "companies",
        header: "Companies",
        render: (row: GsmDevice, idx: number) => (
          <div className="flex flex-wrap gap-1">
            {(Array.isArray(row.companies) ? row.companies : []).map((c, cIdx) => (
              <span
                key={`${idx}-c-${cIdx}`}
                className="rounded-full bg-zinc-200 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {String((c as Record<string, unknown>).name ?? "Company")}
              </span>
            ))}
          </div>
        ),
      },
      { key: "created_at", header: "Created At", render: (row: GsmDevice) => formatDate(String(row.created_at ?? "")) },
      {
        key: "actions",
        header: "Actions",
        render: (row: GsmDevice) => (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="rounded-lg bg-zinc-900 px-2 py-1 text-xs font-medium text-white dark:bg-emerald-600"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => row.id != null && openAssign(row.id)}
              className="rounded-lg bg-sky-600 px-2 py-1 text-xs font-medium text-white"
            >
              Assign Company
            </button>
            <button
              type="button"
              onClick={() => {
                if (row.id == null) return;
                if (!window.confirm("Delete this GSM?")) return;
                deleteMutation.mutate(row.id);
              }}
              className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-medium text-white"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [deleteMutation],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <InputField
          label="Ip Address"
          value={draft.ip_address}
          onChange={(v) => setDraft((s) => ({ ...s, ip_address: v }))}
          placeholder="IP Address"
        />
        <InputField
          label="GSM Name"
          value={draft.name}
          onChange={(v) => setDraft((s) => ({ ...s, name: v }))}
          placeholder="GSM Name"
        />
        <SelectField
          label="GSM Status"
          value={draft.status}
          onChange={(v) => setDraft((s) => ({ ...s, status: v }))}
          options={[
            { value: "", label: "All" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
        <SelectField
          label="Device Status"
          value={draft.device_status}
          onChange={(v) => setDraft((s) => ({ ...s, device_status: v }))}
          options={[
            { value: "", label: "All" },
            { value: "power_on", label: "Power On" },
            { value: "power_off", label: "Power Off" },
          ]}
        />
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setFilters({ ...draft })}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-emerald-600"
          >
            Submit
          </button>
        </div>
      </div>

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
            + Add GSM
          </button>
        </div>
        <PaginatedDataTable
          columns={columns}
          rows={rows}
          isLoading={gsmQuery.isPending}
          emptyMessage="No GSM records found"
          minWidthClassName="min-w-[72rem]"
          initialPerPage={10}
          getRowKey={(row, idx) => String(row.id ?? idx)}
        />
      </div>

      <GsmFormModal
        open={showAdd}
        title="Add GSM"
        submitLabel="Create"
        form={addForm}
        includeStatus={false}
        onClose={() => setShowAdd(false)}
        onChange={setAddForm}
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate({
            name: addForm.name.trim(),
            ip_address: addForm.ip_address.trim(),
            username: addForm.username.trim(),
            password: addForm.password,
          });
        }}
      />

      <GsmFormModal
        open={showEdit}
        title="Edit GSM"
        submitLabel="Update"
        form={editForm}
        includeStatus
        onClose={() => setShowEdit(false)}
        onChange={setEditForm}
        onSubmit={(e) => {
          e.preventDefault();
          if (editId == null) return;
          updateMutation.mutate({
            id: editId,
            payload: {
              name: editForm.name.trim(),
              ip_address: editForm.ip_address.trim(),
              username: editForm.username.trim(),
              password: editForm.password,
              status: editForm.status,
            },
          });
        }}
      />

      {showAssign ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (assignGsmId == null || !assignCompanyId) return;
              assignMutation.mutate({
                gsmId: assignGsmId,
                companyId: assignCompanyId,
              });
            }}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h4 className="mb-3 text-lg font-semibold">Assign Company</h4>
            <SelectField
              label="Company"
              value={assignCompanyId}
              onChange={setAssignCompanyId}
              options={[{ value: "", label: "Select Company" }].concat(
                companyRows.map((c, idx) => ({
                  value: String(c.id ?? ""),
                  label: String(c.name ?? `Company ${idx + 1}`),
                })),
              )}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAssign(false)}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-emerald-600"
              >
                Assign
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function GsmFormModal({
  open,
  title,
  submitLabel,
  form,
  includeStatus,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean;
  title: string;
  submitLabel: string;
  form: GsmForm;
  includeStatus: boolean;
  onClose: () => void;
  onChange: (form: GsmForm) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h4 className="mb-3 text-lg font-semibold">{title}</h4>
        <div className="space-y-2">
          <InputField
            label="Name"
            value={form.name}
            onChange={(v) => onChange({ ...form, name: v })}
            placeholder="Name"
          />
          <InputField
            label="IP Address"
            value={form.ip_address}
            onChange={(v) => onChange({ ...form, ip_address: v })}
            placeholder="IP Address"
          />
          <InputField
            label="Username"
            value={form.username}
            onChange={(v) => onChange({ ...form, username: v })}
            placeholder="Username"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => onChange({ ...form, password: e.target.value })}
              placeholder="Password"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          {includeStatus ? (
            <SelectField
              label="Status"
              value={form.status}
              onChange={(v) =>
                onChange({
                  ...form,
                  status: v === "inactive" ? "inactive" : "active",
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

function SelectField({
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
      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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

function InputField({
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
      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
    </div>
  );
}
