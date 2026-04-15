"use client";

import { useMemo, useState } from "react";
import { PaginatedDataTable } from "@/components/ui/PaginatedDataTable";
import { useCompanies } from "@/hooks/company/useCompanies";
import { useGsm, useGsmClientProfile } from "@/hooks/gsm/useGsm";

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

function splitByComma(input: unknown): string[] {
  if (typeof input !== "string" || input.trim() === "") return [];
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitByPipe(input: unknown): string[] {
  if (typeof input !== "string" || input.trim() === "") return [];
  return input
    .split(/\s*\|\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ClientGsmProfilingModuleView() {
  const [draft, setDraft] = useState({ company_id: "", gsm_id: "" });
  const [filters, setFilters] = useState(draft);

  const companiesQuery = useCompanies();
  const gsmQuery = useGsm();
  const profileQuery = useGsmClientProfile(
    useMemo(
      () => ({
        company_id: filters.company_id || undefined,
        gsm_id: filters.gsm_id || undefined,
        draw: 1,
        start: 0,
        length: 100,
      }),
      [filters],
    ),
  );

  const companyRows = useMemo(() => extractRows(companiesQuery.data), [companiesQuery.data]);
  const gsmRows = gsmQuery.data?.rows ?? [];
  const rows = profileQuery.data?.rows ?? [];
  const columns = useMemo(
    () => [
      { key: "company_name", header: "Company Name", render: (row: Record<string, unknown>) => String(row.company_name ?? "-") },
      {
        key: "assigned_gsms",
        header: "Assigned GSM",
        render: (row: Record<string, unknown>, idx: number) => (
          <>
            {splitByComma(row.assigned_gsms).map((line, lineIdx) => (
              <div key={`${idx}-gsm-${lineIdx}`}>{line}</div>
            ))}
          </>
        ),
      },
      { key: "gsm_count", header: "Total GSM", render: (row: Record<string, unknown>) => String(row.gsm_count ?? "-") },
      {
        key: "assigned_ports",
        header: "Assigned Ports",
        render: (row: Record<string, unknown>, idx: number) => (
          <>
            {splitByPipe(row.assigned_ports).map((line, lineIdx) => (
              <div key={`${idx}-port-${lineIdx}`}>{line}</div>
            ))}
          </>
        ),
      },
      { key: "port_count", header: "Total Ports", render: (row: Record<string, unknown>) => String(row.port_count ?? "-") },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SelectField
          label="Select Company"
          value={draft.company_id}
          onChange={(v) => setDraft((s) => ({ ...s, company_id: v }))}
          options={[{ value: "", label: "All" }].concat(
            companyRows.map((c, idx) => ({
              value: String(c.id ?? ""),
              label: String(c.name ?? `Company ${idx + 1}`),
            })),
          )}
        />
        <SelectField
          label="Select GSM"
          value={draft.gsm_id}
          onChange={(v) => setDraft((s) => ({ ...s, gsm_id: v }))}
          options={[{ value: "", label: "All" }].concat(
            gsmRows.map((g, idx) => ({
              value: String(g.id ?? ""),
              label: String(g.ip_address ?? g.name ?? `GSM ${idx + 1}`),
            })),
          )}
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
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-800">
          Details
        </div>
        <PaginatedDataTable
          columns={columns}
          rows={rows as Array<Record<string, unknown>>}
          isLoading={profileQuery.isPending}
          loadingMessage="Loading data..."
          emptyMessage="No profiling rows found"
          minWidthClassName="min-w-[64rem]"
          getRowKey={(row, idx) => String((row as Record<string, unknown>).id ?? idx)}
        />
      </div>
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
