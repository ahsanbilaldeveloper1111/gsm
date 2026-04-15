"use client";

import { useMemo, useState } from "react";
import { PaginatedDataTable } from "@/components/ui/PaginatedDataTable";
import { useGsm } from "@/hooks/gsm/useGsm";
import { useInbox } from "@/hooks/inbox/useInbox";
import { usePortsByGsm } from "@/hooks/ports/usePorts";

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

  const gsmQuery = useGsm();
  const portsQuery = usePortsByGsm(draft.gsm_id || null);

  const inboxParams = useMemo(
    () => ({
      gsm_id: filters.gsm_id || undefined,
      port_id: filters.port_id || undefined,
      sender: filters.sender || undefined,
      message: filters.message || undefined,
      draw: 1,
      start: 0,
      length: 100,
    }),
    [filters],
  );
  const inboxQuery = useInbox(inboxParams);

  const gsmRows = gsmQuery.data?.rows ?? [];
  const portRows = portsQuery.data?.rows ?? [];
  const rows = inboxQuery.data?.rows ?? [];
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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            GSM
          </label>
          <select
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Port
          </label>
          <select
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Sender
          </label>
          <input
            value={draft.sender}
            onChange={(e) => setDraft((s) => ({ ...s, sender: e.target.value }))}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="Enter Sender"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Message
          </label>
          <input
            value={draft.message}
            onChange={(e) => setDraft((s) => ({ ...s, message: e.target.value }))}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="Enter Message"
          />
        </div>

        <div className="flex items-end gap-2 md:col-span-2">
          <button
            type="button"
            onClick={() => setFilters({ ...draft })}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-emerald-600"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={() => {
              const empty = { gsm_id: "", port_id: "", sender: "", message: "" };
              setDraft(empty);
              setFilters(empty);
            }}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            Clear
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
          isLoading={inboxQuery.isPending}
          emptyMessage="No inbox records found"
          minWidthClassName="min-w-[72rem]"
          getRowKey={(row, idx) => String((row as Record<string, unknown>).id ?? idx)}
        />
      </div>
    </div>
  );
}
