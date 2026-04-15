"use client";

import { useMemo, useState } from "react";
import { PaginatedDataTable } from "@/components/ui/PaginatedDataTable";
import { useGsm } from "@/hooks/gsm/useGsm";
import { useOutbox } from "@/hooks/outbox/useOutbox";
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
      ...dataTablesPaging(page, perPage),
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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            GSM
          </label>
          <select
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Select Port
          </label>
          <select
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setGsmFilter(gsmDraft);
              setPortFilter(portDraft);
              setPage(1);
            }}
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
