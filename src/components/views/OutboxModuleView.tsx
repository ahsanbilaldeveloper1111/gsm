"use client";

import { useMemo, useState } from "react";
import {
  FilterPanel,
  FilterPanelField,
  filterSelectControlClassName,
} from "@/components/ui/FilterPanel";
import { PaginatedDataTable } from "@/components/ui/PaginatedDataTable";
import { useGsm } from "@/hooks/gsm/useGsm";
import { useOutbox } from "@/hooks/outbox/useOutbox";
import { usePortsByGsm } from "@/hooks/ports/usePorts";
import {
  deriveTotalsFromTelecomPagination,
  gsmDropdownListParams,
  laravelPageParams,
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

export function OutboxModuleView() {
  const [gsmDraft, setGsmDraft] = useState<string>("");
  const [portDraft, setPortDraft] = useState<string>("");
  const [gsmFilter, setGsmFilter] = useState<string>("");
  const [portFilter, setPortFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const gsmQuery = useGsm(gsmDropdownListParams);
  const portsQuery = usePortsByGsm(gsmDraft || null);

  const outboxParams = useMemo(
    () => ({
      gsm_id: gsmFilter || undefined,
      port_id: portFilter || undefined,
      ...laravelPageParams(page, perPage),
    }),
    [gsmFilter, portFilter, page, perPage],
  );
  const outboxQuery = useOutbox(outboxParams);

  const gsmRows = gsmQuery.data?.rows ?? [];
  const portRows = portsQuery.data?.rows ?? [];
  const outboxRows = outboxQuery.data?.rows ?? [];
  const pagination = outboxQuery.data?.pagination;
  const { totalRows, totalPages } = deriveTotalsFromTelecomPagination(
    pagination,
    outboxRows.length,
    perPage,
  );
  useClampPageToLastPage(pagination?.last_page, page, setPage);
  const columns = useMemo(
    () => [
      { key: "ip", header: "IP Address", render: (row: Record<string, unknown>) => String(row.ip_address ?? "-") },
      { key: "port", header: "Port #", render: (row: Record<string, unknown>) => String((row.port as Record<string, unknown> | undefined)?.port_number ?? "-") },
      { key: "mobile", header: "Mobile Number", render: (row: Record<string, unknown>) => String(row.number ?? "-") },
      { key: "text", header: "Text", render: (row: Record<string, unknown>) => String(row.text ?? "-") },
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
            setGsmFilter(gsmDraft);
            setPortFilter(portDraft);
            setPage(1);
          },
        }}
      >
        <FilterPanelField label="GSM">
          <select
            className={filterSelectControlClassName}
            value={gsmDraft}
            onChange={(e) => {
              setGsmDraft(e.target.value);
              setPortDraft("");
            }}
          >
            <option value="">All</option>
            {gsmRows.map((gsm, idx) => (
              <option key={String(gsm.id ?? idx)} value={String(gsm.id ?? "")}>
                {String(gsm.name ?? `GSM ${gsm.id ?? ""}`)}
              </option>
            ))}
          </select>
        </FilterPanelField>
        <FilterPanelField label="Port">
          <select
            className={filterSelectControlClassName}
            value={portDraft}
            onChange={(e) => setPortDraft(e.target.value)}
            disabled={!gsmDraft}
          >
            <option value="">-- Select Port --</option>
            {portRows.map((port, idx) => (
              <option key={String(port.id ?? idx)} value={String(port.id ?? "")}>
                {`Port ${String(port.port_number ?? port.port ?? port.id ?? "")}`}
              </option>
            ))}
          </select>
        </FilterPanelField>
      </FilterPanel>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-800">
          Details
        </div>
        <PaginatedDataTable
          columns={columns}
          rows={outboxRows as Array<Record<string, unknown>>}
          isLoading={outboxQuery.isPending}
          emptyMessage="No outbox records found"
          minWidthClassName="min-w-[56rem]"
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
