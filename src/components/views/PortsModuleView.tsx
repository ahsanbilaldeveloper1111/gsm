"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompanies } from "@/hooks/company/useCompanies";
import { useGsm } from "@/hooks/gsm/useGsm";
import { usePorts, usePortsByGsm } from "@/hooks/ports/usePorts";
import {
  deriveTotalsFromTelecomPagination,
  gsmDropdownListParams,
  useClampPageToLastPage,
} from "@/lib/pagination/serverPagination";
import { queryKeys } from "@/lib/queryKeys";
import { showAppToast, showBillingBackendErrorToast } from "@/lib/toast/appToast";
import type { IndexPortParams } from "@/models/Port";
import { portsService } from "@/services/ports.service";
import {
  FilterPanel,
  filterFieldLabelClassName,
  filterSecondaryButtonClassName,
  filterSelectControlClassName,
  filterTextControlClassName,
} from "@/components/ui/FilterPanel";
import { PaginatedDataTable } from "@/components/ui/PaginatedDataTable";

type PortFilters = {
  gsm_id: string;
  port_id: string;
  company_id: string;
  sim_status: string;
  operator: string;
  mobile_number: string;
  iccid: string;
};

const defaultFilters: PortFilters = {
  gsm_id: "",
  port_id: "",
  company_id: "",
  sim_status: "",
  operator: "",
  mobile_number: "",
  iccid: "",
};

type PortEditModal = {
  id: number | string;
  mobile_number: string;
} | null;

function signalBars(status: unknown) {
  const up = String(status ?? "").toLowerCase() === "up";
  return (
    <div className="flex items-end gap-[2px]">
      {[6, 10, 14, 18, 22].map((h, i) => (
        <span
          key={i}
          className={`inline-block w-1 rounded-sm ${up ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

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

function extractMessage(payload: unknown): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const m = (payload as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m.trim();
  }
  return "Completed.";
}

export function PortsModuleView() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<PortFilters>(defaultFilters);
  const [filters, setFilters] = useState<PortFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [edit, setEdit] = useState<PortEditModal>(null);

  const gsmQuery = useGsm(gsmDropdownListParams);
  const companiesQuery = useCompanies();
  const portsByGsmQuery = usePortsByGsm(draft.gsm_id || null);
  const listParams: IndexPortParams = useMemo(
    () => ({
      gsm_id: filters.gsm_id || undefined,
      port_id: filters.port_id || undefined,
      company_id: filters.company_id || undefined,
      sim_status: filters.sim_status || undefined,
      operator: filters.operator || undefined,
      mobile_number: filters.mobile_number || undefined,
      iccid: filters.iccid || undefined,
      page,
      perPage,
    }),
    [filters, page, perPage],
  );
  const portsQuery = usePorts(listParams);

  const gsmRows = gsmQuery.data?.rows ?? [];
  const companyRows = useMemo(
    () => extractRows(companiesQuery.data),
    [companiesQuery.data],
  );
  const gsmPortRows = portsByGsmQuery.data?.rows ?? [];
  const rows = portsQuery.data?.rows ?? [];
  const pagination = portsQuery.data?.pagination;
  const { totalRows, totalPages } = deriveTotalsFromTelecomPagination(
    pagination,
    rows.length,
    perPage,
  );
  useClampPageToLastPage(pagination?.last_page, page, setPage);

  const syncMutation = useMutation({
    mutationFn: () => portsService.syncSimStatus(),
    onSuccess: (data) => {
      showAppToast(extractMessage(data), "success");
      queryClient.invalidateQueries({ queryKey: queryKeys.ports.all });
    },
    onError: showBillingBackendErrorToast,
  });

  const updateMobileMutation = useMutation({
    mutationFn: ({ id, mobile }: { id: number | string; mobile: string }) =>
      portsService.updateMobileNumber(id, mobile),
    onSuccess: () => {
      showAppToast("Port mobile number updated successfully!", "success");
      setEdit(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.ports.all });
    },
    onError: showBillingBackendErrorToast,
  });

  const columns = useMemo(
    () => [
      { key: "ip", header: "IP Address", render: (row: Record<string, unknown>) => String(row.ip_address ?? "-") },
      { key: "port", header: "Port #", render: (row: Record<string, unknown>) => String(row.port_number ?? row.port ?? "-") },
      { key: "mobile", header: "Mobile Number", render: (row: Record<string, unknown>) => String(row.mobile_number ?? "-") },
      { key: "sim", header: "Sim Status", render: (row: Record<string, unknown>) => String(row.sim_status ?? "-") },
      { key: "operator", header: "Operator", render: (row: Record<string, unknown>) => String(row.operator ?? "-") },
      { key: "signal", header: "Signal", render: (row: Record<string, unknown>) => signalBars(row.status) },
      { key: "imei", header: "IMEI", render: (row: Record<string, unknown>) => String(row.imei ?? "-") },
      { key: "imsi", header: "IMSI", render: (row: Record<string, unknown>) => String(row.imsi ?? "-") },
      { key: "iccid", header: "ICCID", render: (row: Record<string, unknown>) => String(row.iccid ?? "-") },
      { key: "status", header: "Port Status", render: (row: Record<string, unknown>) => String(row.status ?? "-") },
      { key: "company", header: "Company", render: (row: Record<string, unknown>) => String(row.companies ?? "-") },
      {
        key: "actions",
        header: "Action",
        render: (row: Record<string, unknown>) => (
          <button
            type="button"
            onClick={() =>
              row.id != null &&
              setEdit({
                id: row.id as number | string,
                mobile_number: String(row.mobile_number ?? ""),
              })
            }
            className="rounded-lg bg-zinc-900 px-2 py-1 text-xs font-medium text-white dark:bg-emerald-600"
          >
            Update Mobile Number
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">GSM Ports Management</h3>
        <button
          type="button"
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-emerald-600"
        >
          Sync Sim Status
        </button>
      </div>

      <FilterPanel
        primaryAction={{
          label: "Apply filters",
          onClick: () => {
            setFilters({ ...draft });
            setPage(1);
          },
        }}
        secondaryActions={
          <button
            type="button"
            className={filterSecondaryButtonClassName}
            onClick={() => {
              setDraft(defaultFilters);
              setFilters(defaultFilters);
              setPage(1);
            }}
          >
            Clear
          </button>
        }
      >
        <SelectField
          label="GSM"
          value={draft.gsm_id}
          onChange={(value) => setDraft((s) => ({ ...s, gsm_id: value, port_id: "" }))}
          options={[{ value: "", label: "All" }].concat(
            gsmRows.map((g, idx) => ({
              value: String(g.id ?? ""),
              label: `${String(g.name ?? `GSM ${idx + 1}`)} (${String(g.ip_address ?? "-")})`,
            })),
          )}
        />
        <SelectField
          label="Port"
          value={draft.port_id}
          onChange={(value) => setDraft((s) => ({ ...s, port_id: value }))}
          options={[{ value: "", label: "All" }].concat(
            gsmPortRows.map((p, idx) => ({
              value: String(p.port_number ?? p.port ?? ""),
              label: `Port ${String(p.port_number ?? p.port ?? idx + 1)}`,
            })),
          )}
        />
        <SelectField
          label="Company"
          value={draft.company_id}
          onChange={(value) => setDraft((s) => ({ ...s, company_id: value }))}
          options={[{ value: "", label: "All" }].concat(
            companyRows.map((c, idx) => ({
              value: String(c.id ?? ""),
              label: String(c.name ?? `Company ${idx + 1}`),
            })),
          )}
        />
        <SelectField
          label="SIM Status"
          value={draft.sim_status}
          onChange={(value) => setDraft((s) => ({ ...s, sim_status: value }))}
          options={[
            { value: "", label: "All" },
            { value: "REGISTER_OK", label: "REGISTER" },
            { value: "UNREGISTER_OK", label: "UNREGISTER" },
            { value: "NO_SIM", label: "NO SIM" },
            { value: "POWER_OFF", label: "POWER_OFF" },
          ]}
        />
        <SelectField
          label="Operator"
          value={draft.operator}
          onChange={(value) => setDraft((s) => ({ ...s, operator: value }))}
          options={[
            { value: "", label: "All" },
            { value: "Etisalat", label: "Etisalat by e&" },
            { value: "du", label: "Du" },
          ]}
        />
        <InputField
          label="Mobile Number"
          value={draft.mobile_number}
          onChange={(value) => setDraft((s) => ({ ...s, mobile_number: value }))}
          placeholder="Enter Mobile Number"
        />
        <InputField
          label="ICCID"
          value={draft.iccid}
          onChange={(value) => setDraft((s) => ({ ...s, iccid: value }))}
          placeholder="Enter ICCID"
        />
      </FilterPanel>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-800">
          Details
        </div>
        <PaginatedDataTable
          columns={columns}
          rows={rows}
          isLoading={portsQuery.isPending}
          emptyMessage="No ports found"
          minWidthClassName="min-w-[88rem]"
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

      {edit ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMobileMutation.mutate({
                id: edit.id,
                mobile: edit.mobile_number,
              });
            }}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h4 className="mb-3 text-lg font-semibold">Edit Port Mobile Number</h4>
            <InputField
              label="Mobile Number"
              value={edit.mobile_number}
              onChange={(value) => setEdit((s) => (s ? { ...s, mobile_number: value } : s))}
              placeholder="Mobile Number"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEdit(null)}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-emerald-600"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      ) : null}
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
