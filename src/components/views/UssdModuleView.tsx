"use client";

import { useMemo, useState } from "react";
import { PaginatedDataTable } from "@/components/ui/PaginatedDataTable";
import { useGsm } from "@/hooks/gsm/useGsm";
import { usePortsByGsm } from "@/hooks/ports/usePorts";
import { useUssd } from "@/hooks/ussd/useUssd";
import {
  dataTablesPaging,
  deriveTotalsFromTelecomPagination,
  gsmDropdownListParams,
  useClampPageToLastPage,
} from "@/lib/pagination/serverPagination";

export function UssdModuleView() {
  const [gsmDraft, setGsmDraft] = useState<string>("");
  const [portDraft, setPortDraft] = useState<string>("");
  const [gsmFilter, setGsmFilter] = useState<string>("");
  const [portFilter, setPortFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const gsmQuery = useGsm(gsmDropdownListParams);
  const portsQuery = usePortsByGsm(gsmDraft || null);

  const ussdParams = useMemo(
    () => ({
      gsm_id: gsmFilter || undefined,
      port_id: portFilter || undefined,
      ...dataTablesPaging(page, perPage),
    }),
    [gsmFilter, portFilter, page, perPage],
  );
  const ussdQuery = useUssd(ussdParams);

  const gsmRows = gsmQuery.data?.rows ?? [];
  const portRows = portsQuery.data?.rows ?? [];
  const ussdRows = ussdQuery.data?.rows ?? [];
  const pagination = ussdQuery.data?.pagination;
  const { totalRows, totalPages } = deriveTotalsFromTelecomPagination(
    pagination,
    ussdRows.length,
    perPage,
  );
  useClampPageToLastPage(pagination?.last_page, page, setPage);
  const columns = useMemo(
    () => [
      { key: "ip", header: "IP Address", render: (row: Record<string, unknown>) => String(row.ip_address ?? "-") },
      { key: "port", header: "Port #", render: (row: Record<string, unknown>) => String((row.port as Record<string, unknown> | undefined)?.port_number ?? "-") },
      { key: "text", header: "Text", render: (row: Record<string, unknown>) => String(row.text ?? "-") },
      {
        key: "datetime",
        header: "DateTime",
        render: (row: Record<string, unknown>) =>
          row.created_at ? new Date(String(row.created_at)).toLocaleString() : "-",
      },
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
              <option key={String(gsm.id ?? gsm.ip_address ?? idx)} value={String(gsm.id ?? "")}>
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
              <option key={String(port.id ?? port.port ?? idx)} value={String(port.id ?? "")}>
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
          rows={ussdRows as Array<Record<string, unknown>>}
          isLoading={ussdQuery.isPending}
          emptyMessage="No USSD records found"
          minWidthClassName="min-w-[48rem]"
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
