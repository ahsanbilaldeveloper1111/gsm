"use client";

import { useMemo, useState } from "react";
import {
  FilterPanel,
  filterFieldLabelClassName,
  filterSecondaryButtonClassName,
  filterSelectControlClassName,
  filterTextControlClassName,
} from "@/components/ui/FilterPanel";
import { PaginatedDataTable } from "@/components/ui/PaginatedDataTable";
import { useCdr } from "@/hooks/cdr/useCdr";
import { useGsm } from "@/hooks/gsm/useGsm";
import { usePortsByGsm } from "@/hooks/ports/usePorts";
import {
  dataTablesPaging,
  deriveTotalsFromTelecomPagination,
  gsmDropdownListParams,
  useClampPageToLastPage,
} from "@/lib/pagination/serverPagination";

function formatDateTime(input?: string): string {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
}

export function CdrModuleView() {
  const [draft, setDraft] = useState({
    gsm_id: "",
    port_id: "",
    source_number: "",
    destination_number: "",
    start_date: "",
    answer_date: "",
  });
  const [filters, setFilters] = useState(draft);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const gsmQuery = useGsm(gsmDropdownListParams);
  const portsQuery = usePortsByGsm(draft.gsm_id || null);

  const cdrParams = useMemo(
    () => ({
      gsm_id: filters.gsm_id || undefined,
      port_id: filters.port_id || undefined,
      source_number: filters.source_number || undefined,
      destination_number: filters.destination_number || undefined,
      start_date: filters.start_date || undefined,
      answer_date: filters.answer_date || undefined,
      ...dataTablesPaging(page, perPage),
    }),
    [filters, page, perPage],
  );
  const cdrQuery = useCdr(cdrParams);

  const gsmRows = gsmQuery.data?.rows ?? [];
  const portRows = portsQuery.data?.rows ?? [];
  const rows = cdrQuery.data?.rows ?? [];
  const pagination = cdrQuery.data?.pagination;
  const { totalRows, totalPages } = deriveTotalsFromTelecomPagination(
    pagination,
    rows.length,
    perPage,
  );
  useClampPageToLastPage(pagination?.last_page, page, setPage);
  const columns = useMemo(
    () => [
      { key: "ip_address", header: "IP Address", render: (row: Record<string, unknown>) => String(row.ip_address ?? "-") },
      { key: "port_number", header: "Port #", render: (row: Record<string, unknown>) => String((row.port as Record<string, unknown> | undefined)?.port_number ?? "-") },
      { key: "mobile_number", header: "Mobile Number", render: (row: Record<string, unknown>) => String((row.port as Record<string, unknown> | undefined)?.mobile_number ?? "-") },
      { key: "start_date", header: "Start Date", render: (row: Record<string, unknown>) => String(row.start_date ?? "-") },
      { key: "answer_date", header: "Answer Date", render: (row: Record<string, unknown>) => String(row.answer_date ?? "-") },
      { key: "duration", header: "Duration", render: (row: Record<string, unknown>) => String(row.duration ?? "-") },
      { key: "source_number", header: "Source Number", render: (row: Record<string, unknown>) => String(row.source_number ?? "-") },
      { key: "destination_number", header: "Destination Number", render: (row: Record<string, unknown>) => String(row.number ?? row.destination_number ?? "-") },
      { key: "direction", header: "Direction", render: (row: Record<string, unknown>) => String(row.direction ?? "-") },
      { key: "ip", header: "IP", render: (row: Record<string, unknown>) => String(row.ip ?? "-") },
      { key: "codec", header: "Codec", render: (row: Record<string, unknown>) => String(row.codec ?? "-") },
      { key: "hangup", header: "Hangup", render: (row: Record<string, unknown>) => String(row.hangup ?? "-") },
      { key: "gsm_code", header: "GSM Code", render: (row: Record<string, unknown>) => String(row.gsm_code ?? "-") },
      { key: "bcch", header: "BCCH", render: (row: Record<string, unknown>) => String(row.bcch ?? "-") },
      { key: "reason", header: "Reason", render: (row: Record<string, unknown>) => String(row.reason ?? "-") },
      { key: "created_at", header: "DateTime", render: (row: Record<string, unknown>) => formatDateTime(String(row.created_at ?? "")) },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <FilterPanel
        fieldsClassName="flex flex-wrap items-end gap-4"
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
              const empty = {
                gsm_id: "",
                port_id: "",
                source_number: "",
                destination_number: "",
                start_date: "",
                answer_date: "",
              };
              setDraft(empty);
              setFilters(empty);
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
          onChange={(v) => setDraft((s) => ({ ...s, gsm_id: v, port_id: "" }))}
          options={[{ value: "", label: "All" }].concat(
            gsmRows.map((g, idx) => ({
              value: String(g.id ?? ""),
              label: String(g.name ?? `GSM ${idx + 1}`),
            })),
          )}
        />
        <SelectField
          label="Select Port"
          value={draft.port_id}
          onChange={(v) => setDraft((s) => ({ ...s, port_id: v }))}
          options={[{ value: "", label: "-- Select Port --" }].concat(
            portRows.map((p, idx) => ({
              value: String(p.id ?? ""),
              label: `Port ${String(p.port_number ?? p.port ?? idx + 1)}`,
            })),
          )}
        />
        <TextField
          label="Mobile Number"
          value={draft.source_number}
          onChange={(v) => setDraft((s) => ({ ...s, source_number: v }))}
        />
        <TextField
          label="Destination Number"
          value={draft.destination_number}
          onChange={(v) => setDraft((s) => ({ ...s, destination_number: v }))}
        />
        <DateField
          label="Start Date"
          value={draft.start_date}
          onChange={(v) => setDraft((s) => ({ ...s, start_date: v }))}
        />
        <DateField
          label="Answer Date"
          value={draft.answer_date}
          onChange={(v) => setDraft((s) => ({ ...s, answer_date: v }))}
        />
      </FilterPanel>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-800">
          Details
        </div>
        <PaginatedDataTable
          columns={columns}
          rows={rows as Array<Record<string, unknown>>}
          isLoading={cdrQuery.isPending}
          emptyMessage="No CDR records found"
          minWidthClassName="min-w-[110rem]"
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

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={filterFieldLabelClassName}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={filterTextControlClassName}
      />
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={filterFieldLabelClassName}>{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={filterTextControlClassName}
      />
    </div>
  );
}
