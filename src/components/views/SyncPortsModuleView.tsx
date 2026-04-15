"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useGsm } from "@/hooks/gsm/useGsm";
import { gsmDropdownListParams } from "@/lib/pagination/serverPagination";
import { usePortsByGsm } from "@/hooks/ports/usePorts";
import { showAppToast, showBillingBackendErrorToast } from "@/lib/toast/appToast";
import { portsService } from "@/services/ports.service";

function extractMessage(payload: unknown): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const m = (payload as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m.trim();
  }
  return "Sync completed.";
}

export function SyncPortsModuleView() {
  const [gsmId, setGsmId] = useState<string>("");
  const [selectedPorts, setSelectedPorts] = useState<string[]>([]);

  const gsmQuery = useGsm(gsmDropdownListParams);
  const portsQuery = usePortsByGsm(gsmId || null);

  const gsmRows = gsmQuery.data?.rows ?? [];
  const portRows = portsQuery.data?.rows ?? [];

  const syncTypeMutation = useMutation({
    mutationFn: ({ type, gsm }: { type: string; gsm: string }) =>
      portsService.syncPorts(type, gsm),
    onSuccess: (data) => showAppToast(extractMessage(data), "success"),
    onError: (error) => showBillingBackendErrorToast(error),
  });

  const syncMobileMutation = useMutation({
    mutationFn: ({ gsm, ports }: { gsm: string; ports: string[] }) =>
      portsService.syncPortsMobileNumber(gsm, ports),
    onSuccess: (data) => showAppToast(extractMessage(data), "success"),
    onError: (error) => showBillingBackendErrorToast(error),
  });

  const isBusy = syncTypeMutation.isPending || syncMobileMutation.isPending;

  const selectedPortCount = useMemo(() => selectedPorts.length, [selectedPorts]);

  function onSyncType(type: string) {
    if (!gsmId) {
      showAppToast("Please select GSM first.", "warning");
      return;
    }
    syncTypeMutation.mutate({ type, gsm: gsmId });
  }

  function onSyncMobileNumbers() {
    if (!gsmId) {
      showAppToast("Please select GSM first.", "warning");
      return;
    }
    if (selectedPorts.length === 0) {
      showAppToast("Please select at least one port.", "warning");
      return;
    }
    syncMobileMutation.mutate({ gsm: gsmId, ports: selectedPorts });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            GSM
          </label>
          <select
            value={gsmId}
            onChange={(e) => {
              setGsmId(e.target.value);
              setSelectedPorts([]);
            }}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Select GSM</option>
            {gsmRows.map((gsm, idx) => (
              <option key={String(gsm.id ?? idx)} value={String(gsm.id ?? "")}>
                {`${String(gsm.name ?? `GSM ${gsm.id ?? ""}`)} (${String(gsm.ip_address ?? "-")})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <h5 className="mr-2 text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
          Sync Options
        </h5>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onSyncType("imei")}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-emerald-600"
        >
          IMEI
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onSyncType("iccid")}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-emerald-600"
        >
          ICCID
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onSyncType("imsi")}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-emerald-600"
        >
          IMSI
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onSyncType("reg")}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-emerald-600"
        >
          Sim Status
        </button>
      </div>

      <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
        <h5 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
          Select Port
        </h5>
        <select
          multiple
          value={selectedPorts}
          onChange={(e) =>
            setSelectedPorts(Array.from(e.target.selectedOptions).map((o) => o.value))
          }
          className="h-44 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          disabled={!gsmId}
        >
          {portRows.map((port, idx) => (
            <option key={String(port.id ?? idx)} value={String(port.id ?? "")}>
              {`Port ${String(port.port_number ?? port.port ?? port.id ?? "")}`}
            </option>
          ))}
        </select>
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">{selectedPortCount} selected</p>
          <button
            type="button"
            disabled={isBusy}
            onClick={onSyncMobileNumbers}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-emerald-600"
          >
            Sync Port Mobile Number
          </button>
        </div>
      </div>
    </div>
  );
}
