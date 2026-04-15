"use client";

import { useMemo, useState } from "react";
import {
  FilterPanel,
  FilterPanelField,
  filterSecondaryButtonClassName,
  filterSelectControlClassName,
  filterTextControlClassName,
} from "@/components/ui/FilterPanel";
import { PaginatedDataTable } from "@/components/ui/PaginatedDataTable";
import { useGsm } from "@/hooks/gsm/useGsm";
import { useInbox } from "@/hooks/inbox/useInbox";
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

export function InboxModuleView() {
  const [draft, setDraft] = useState({
    gsm_id: "",
    port_id: "",
    sender: "",
    message: "",
  });
  const [filters, setFilters] = useState(draft);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const gsmQuery = useGsm(gsmDropdownListParams);
  const portsQuery = usePortsByGsm(draft.gsm_id || null);

  const inboxParams = useMemo(
    () => ({
      gsm_id: filters.gsm_id || undefined,
      port_id: filters.port_id || undefined,
      sender: filters.sender || undefined,
      message: filters.message || undefined,
      ...dataTablesPaging(page, perPage),
    }),
    [filters, page, perPage],
  );
  const inboxQuery = useInbox(inboxParams);

  const gsmRows = gsmQuery.data?.rows ?? [];
  const portRows = portsQuery.data?.rows ?? [];
  const rows = inboxQuery.data?.rows ?? [];
  const pagination = inboxQuery.data?.pagination;
  const { totalRows, totalPages } = deriveTotalsFromTelecomPagination(
    pagination,
    rows.length,
    perPage,
  );
  useClampPageToLastPage(pagination?.last_page, page, setPage);
  const columns = useMemo(
    () => [
      { key: "gsm", header: "GSM", render: (row: Record<string, unknown>) => String((row.gsm as Record<string, unknown> | undefined)?.name ?? "-") },
      { key: "port", header: "Port", render: (row: Record<string, unknown>) => String((row.port as Record<string, unknown> | undefined)?.port_number ?? "-") },
      { key: "mobile", header: "Mobile Number", render: (row: Record<string, unknown>) => String((row.port as Record<string, unknown> | undefined)?.mobile_number ?? "-") },
      { key: "sender", header: "Sender Number", render: (row: Record<string, unknown>) => String(row.number ?? "-") },
      { key: "message", header: "Message", render: (row: Record<string, unknown>) => String(row.text ?? "-") },
      { key: "datetime", header: "DateTime", render: (row: Record<string, unknown>) => formatDateTime(String(row.created_at ?? "")) },
    ],
    [],
  );

  return (
    <div className="space-y-4">
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
              const empty = { gsm_id: "", port_id: "", sender: "", message: "" };
              setDraft(empty);
              setFilters(empty);
              setPage(1);
            }}
          >
            Clear
          </button>
        }
      >
        <FilterPanelField label="GSM">
          <select
            className={filterSelectControlClassName}
            value={draft.gsm_id}
            onChange={(e) =>
              setDraft((s) => ({ ...s, gsm_id: e.target.value, port_id: "" }))
            }
          >
            <option value="">All</option>
            {gsmRows.map((gsm, idx) => (
              <option key={String(gsm.id ?? idx)} value={String(gsm.id ?? "")}>
                {`${String(gsm.name ?? `GSM ${gsm.id ?? ""}`)} (${String(gsm.ip_address ?? "-")})`}
              </option>
            ))}
          </select>
        </FilterPanelField>
        <FilterPanelField label="Port">
          <select
            className={filterSelectControlClassName}
            value={draft.port_id}
            onChange={(e) => setDraft((s) => ({ ...s, port_id: e.target.value }))}
          >
            <option value="">All</option>
            {portRows.map((port, idx) => (
              <option key={String(port.id ?? idx)} value={String(port.id ?? "")}>
                {`Port: ${String(port.port_number ?? port.port ?? port.id ?? "")}`}
              </option>
            ))}
          </select>
        </FilterPanelField>
        <FilterPanelField label="Sender">
          <input
            value={draft.sender}
            onChange={(e) => setDraft((s) => ({ ...s, sender: e.target.value }))}
            className={filterTextControlClassName}
            placeholder="Enter Sender"
          />
        </FilterPanelField>
        <FilterPanelField label="Message">
          <input
            value={draft.message}
            onChange={(e) => setDraft((s) => ({ ...s, message: e.target.value }))}
            className={filterTextControlClassName}
            placeholder="Enter Message"
          />
        </FilterPanelField>
      </FilterPanel>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-800">
          Details
        </div>
        <PaginatedDataTable
          columns={columns}
          rows={rows as Array<Record<string, unknown>>}
          isLoading={inboxQuery.isPending}
          emptyMessage="No inbox records found"
          minWidthClassName="min-w-[72rem]"
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
