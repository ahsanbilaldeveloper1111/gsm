"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PaginatedDataTable } from "@/components/ui/PaginatedDataTable";
import { useCompanies } from "@/hooks/company/useCompanies";
import {
  useGsmAssignments,
  useGsmAssignmentsMutations,
} from "@/hooks/gsm-assignment/useGsmAssignments";
import { useGsm } from "@/hooks/gsm/useGsm";
import { portsService } from "@/services/ports.service";
import { gsmAssignmentsService } from "@/services/gsm-assignments.service";
import { showAppToast, showBillingBackendErrorToast } from "@/lib/toast/appToast";

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

function fmt(input?: string): string {
  if (!input) return "-";
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? input : d.toLocaleString("en-GB");
}

export function GsmCompaniesModuleView() {
  const [draft, setDraft] = useState({ gsm_id: "", company_id: "" });
  const [filters, setFilters] = useState(draft);
  const [showAssign, setShowAssign] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAssignPort, setShowAssignPort] = useState(false);
  const [showUnassignPort, setShowUnassignPort] = useState(false);
  const [showSms, setShowSms] = useState(false);
  const [showUssd, setShowUssd] = useState(false);

  const [editState, setEditState] = useState({
    id: "",
    gsm_id: "",
    company_id: "",
    status: "active",
  });
  const [assignForm, setAssignForm] = useState({ gsm_id: "", company_id: "" });
  const [ctx, setCtx] = useState({ gsm_id: "", company_id: "" });
  const [assignPortId, setAssignPortId] = useState("");
  const [unassignPortId, setUnassignPortId] = useState("");
  const [smsForm, setSmsForm] = useState({ mobile: "", message: "", port: "" });
  const [ussdForm, setUssdForm] = useState({ text: "", port: "" });

  const assignmentsQuery = useGsmAssignments(filters);
  const gsmQuery = useGsm();
  const companiesQuery = useCompanies();

  const { create, update, destroy } = useGsmAssignmentsMutations();
  const rows = assignmentsQuery.data?.rows ?? [];
  const gsmRows = gsmQuery.data?.rows ?? [];
  const companyRows = useMemo(() => extractRows(companiesQuery.data), [companiesQuery.data]);
  const columns = useMemo(
    () => [
      { key: "id", header: "ID", render: (r: Record<string, unknown>) => String(r.id ?? "-") },
      { key: "gsm", header: "GSM", render: (r: Record<string, unknown>) => String((r.gsm as Record<string, unknown> | undefined)?.name ?? "-") },
      { key: "ip", header: "IP Address", render: (r: Record<string, unknown>) => String((r.gsm as Record<string, unknown> | undefined)?.ip_address ?? "-") },
      { key: "company", header: "Company", render: (r: Record<string, unknown>) => String((r.company as Record<string, unknown> | undefined)?.name ?? "-") },
      { key: "assigned_ports", header: "Assigned Ports", render: (r: Record<string, unknown>) => String(r.assigned_ports ?? "-") },
      {
        key: "status",
        header: "Status",
        render: (r: Record<string, unknown>) =>
          String(r.status ?? "") === "active" ? (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Active</span>
          ) : (
            <span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-700">Inactive</span>
          ),
      },
      { key: "created_at", header: "Created At", render: (r: Record<string, unknown>) => fmt(String(r.created_at ?? "")) },
      {
        key: "actions",
        header: "Actions",
        render: (r: Record<string, unknown>) => (
          <div className="flex flex-wrap gap-2">
            <button className="rounded bg-emerald-600 px-2 py-1 text-xs text-white" onClick={() => {
              setCtx({ gsm_id: String((r.gsm as Record<string, unknown> | undefined)?.id ?? ""), company_id: String((r.company as Record<string, unknown> | undefined)?.id ?? "") });
              setSmsForm({ mobile: "", message: "", port: "" });
              setShowSms(true);
            }}>Send SMS</button>
            <button className="rounded bg-amber-500 px-2 py-1 text-xs text-white" onClick={() => {
              setCtx({ gsm_id: String((r.gsm as Record<string, unknown> | undefined)?.id ?? ""), company_id: String((r.company as Record<string, unknown> | undefined)?.id ?? "") });
              setUssdForm({ text: "", port: "" });
              setShowUssd(true);
            }}>Send USSD</button>
            <button className="rounded bg-sky-600 px-2 py-1 text-xs text-white" onClick={async () => {
              const gsm_id = String((r.gsm as Record<string, unknown> | undefined)?.id ?? "");
              const company_id = String((r.company as Record<string, unknown> | undefined)?.id ?? "");
              setCtx({ gsm_id, company_id });
              setAssignPortId("");
              await assignablePortsQuery.mutateAsync(gsm_id);
              setShowAssignPort(true);
            }}>Assign Port</button>
            <button className="rounded bg-sky-600 px-2 py-1 text-xs text-white" onClick={async () => {
              const gsm_id = String((r.gsm as Record<string, unknown> | undefined)?.id ?? "");
              const company_id = String((r.company as Record<string, unknown> | undefined)?.id ?? "");
              setCtx({ gsm_id, company_id });
              setUnassignPortId("");
              await assignedPortsQuery.mutateAsync({ gsm_id, company_id });
              setShowUnassignPort(true);
            }}>Un-Assign Port</button>
            <button className="rounded bg-zinc-900 px-2 py-1 text-xs text-white dark:bg-emerald-600" onClick={() => {
              setEditState({
                id: String(r.id ?? ""),
                gsm_id: String((r.gsm as Record<string, unknown> | undefined)?.id ?? ""),
                company_id: String((r.company as Record<string, unknown> | undefined)?.id ?? ""),
                status: String(r.status ?? "active"),
              });
              setShowEdit(true);
            }}>Edit</button>
            <button className="rounded bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => {
              if (!r.id || !window.confirm("Are you sure you want to delink this GSM Company?")) return;
              destroy.mutate(r.id as number | string);
            }}>Delink Company</button>
          </div>
        ),
      },
    ],
    [destroy],
  );

  const assignablePortsQuery = useMutation({
    mutationFn: (gsm_id: string) => portsService.byGsm(gsm_id),
  });
  const assignedPortsQuery = useMutation({
    mutationFn: (args: { gsm_id: string; company_id: string }) =>
      portsService.assigned(args.gsm_id, args.company_id),
  });

  const assignPortMutation = useMutation({
    mutationFn: () =>
      portsService.assignPort({
        port: assignPortId,
        company: ctx.company_id,
        gsm: ctx.gsm_id,
      }),
    onSuccess: () => {
      showAppToast("Port assigned successfully!", "success");
      setShowAssignPort(false);
      assignmentsQuery.refetch();
    },
    onError: showBillingBackendErrorToast,
  });

  const unassignPortMutation = useMutation({
    mutationFn: () =>
      portsService.assignedRemove(unassignPortId, ctx.gsm_id, ctx.company_id),
    onSuccess: () => {
      showAppToast("Port un-assigned successfully!", "success");
      setShowUnassignPort(false);
      assignmentsQuery.refetch();
    },
    onError: showBillingBackendErrorToast,
  });

  const sendSmsMutation = useMutation({
    mutationFn: () =>
      gsmAssignmentsService.sendSms({
        gsm_id: ctx.gsm_id,
        mobileNumber: smsForm.mobile,
        message: smsForm.message,
        port: smsForm.port || null,
      }),
    onSuccess: () => {
      setShowSms(false);
      showAppToast("SMS sent successfully!", "success");
    },
    onError: showBillingBackendErrorToast,
  });

  const sendUssdMutation = useMutation({
    mutationFn: () =>
      gsmAssignmentsService.sendUssd({
        gsm_id: ctx.gsm_id,
        text: ussdForm.text,
        command: "send",
        port: ussdForm.port ? [Number(ussdForm.port)] : [],
      }),
    onSuccess: () => {
      setShowUssd(false);
      showAppToast("USSD sent successfully!", "success");
    },
    onError: showBillingBackendErrorToast,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SelectField
          label="Select GSM"
          value={draft.gsm_id}
          onChange={(v) => setDraft((s) => ({ ...s, gsm_id: v }))}
          options={[{ value: "", label: "All" }].concat(
            gsmRows.map((g, idx) => ({
              value: String(g.id ?? ""),
              label: `${String(g.name ?? `GSM ${idx + 1}`)} (${String(g.ip_address ?? "-")})`,
            })),
          )}
        />
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
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => setFilters({ ...draft })}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-emerald-600"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={() => setShowAssign(true)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-emerald-600"
          >
            + Add GSM Company
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-800">Details</div>
        <PaginatedDataTable
          columns={columns}
          rows={rows as Array<Record<string, unknown>>}
          isLoading={assignmentsQuery.isPending}
          emptyMessage="No GSM company assignments found"
          minWidthClassName="min-w-[90rem]"
          getRowKey={(row, idx) => String((row as Record<string, unknown>).id ?? idx)}
        />
      </div>

      <AssignModal
        open={showAssign}
        title="Assign Company to GSM"
        gsmRows={gsmRows}
        companyRows={companyRows}
        gsmValue={assignForm.gsm_id}
        companyValue={assignForm.company_id}
        onGsmChange={(v) => setAssignForm((s) => ({ ...s, gsm_id: v }))}
        onCompanyChange={(v) => setAssignForm((s) => ({ ...s, company_id: v }))}
        onClose={() => setShowAssign(false)}
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(
            { gsm_id: assignForm.gsm_id, company_id: assignForm.company_id },
            {
              onSuccess: () => {
                setShowAssign(false);
                showAppToast("Company assigned successfully!", "success");
              },
              onError: showBillingBackendErrorToast,
            },
          );
        }}
      />

      <AssignModal
        open={showEdit}
        title="Edit Company to GSM"
        gsmRows={gsmRows}
        companyRows={companyRows}
        gsmValue={editState.gsm_id}
        companyValue={editState.company_id}
        status={editState.status}
        showStatus
        onStatusChange={(v) => setEditState((s) => ({ ...s, status: v }))}
        onGsmChange={(v) => setEditState((s) => ({ ...s, gsm_id: v }))}
        onCompanyChange={(v) => setEditState((s) => ({ ...s, company_id: v }))}
        onClose={() => setShowEdit(false)}
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate(
            {
              id: editState.id,
              gsm_id: editState.gsm_id,
              company_id: editState.company_id,
              status: editState.status,
            },
            {
              onSuccess: () => {
                setShowEdit(false);
                showAppToast("Assignment updated successfully!", "success");
              },
              onError: showBillingBackendErrorToast,
            },
          );
        }}
      />

      <PortModal
        open={showAssignPort}
        title="Assign Port"
        options={(assignablePortsQuery.data?.rows ?? []).map((p, idx) => ({
          value: String(p.id ?? ""),
          label: `Port ${String(p.port_number ?? p.port ?? idx + 1)} (${String(p.status ?? "-")})`,
        }))}
        value={assignPortId}
        onChange={setAssignPortId}
        onClose={() => setShowAssignPort(false)}
        submitLabel="Assign"
        onSubmit={(e) => {
          e.preventDefault();
          assignPortMutation.mutate();
        }}
      />

      <PortModal
        open={showUnassignPort}
        title="Un Assign Port"
        options={(assignedPortsQuery.data?.rows ?? []).map((p, idx) => ({
          value: String(p.port_id ?? ""),
          label: `Port ${String((p.port as Record<string, unknown> | undefined)?.port_number ?? idx + 1)}`,
        }))}
        value={unassignPortId}
        onChange={setUnassignPortId}
        onClose={() => setShowUnassignPort(false)}
        submitLabel="Un-Assign Port"
        onSubmit={(e) => {
          e.preventDefault();
          unassignPortMutation.mutate();
        }}
      />

      <SmsModal
        open={showSms}
        onClose={() => setShowSms(false)}
        value={smsForm}
        onChange={setSmsForm}
        portOptions={(assignablePortsQuery.data?.rows ?? []).map((p) => ({
          value: String(p.id ?? ""),
          label: `Port ${String(p.port_number ?? p.port ?? p.id ?? "")}`,
        }))}
        onSubmit={(e) => {
          e.preventDefault();
          sendSmsMutation.mutate();
        }}
      />

      <UssdModal
        open={showUssd}
        onClose={() => setShowUssd(false)}
        value={ussdForm}
        onChange={setUssdForm}
        portOptions={(assignablePortsQuery.data?.rows ?? []).map((p) => ({
          value: String(p.id ?? ""),
          label: `Port ${String(p.port_number ?? p.port ?? p.id ?? "")}`,
        }))}
        onSubmit={(e) => {
          e.preventDefault();
          sendUssdMutation.mutate();
        }}
      />
    </div>
  );
}

function ModalShell({
  open,
  title,
  children,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h4 className="mb-3 text-lg font-semibold">{title}</h4>
        {children}
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
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
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

function AssignModal(props: {
  open: boolean;
  title: string;
  gsmRows: Array<{ id?: number | string; name?: string; ip_address?: string }>;
  companyRows: Array<Record<string, unknown>>;
  gsmValue: string;
  companyValue: string;
  status?: string;
  showStatus?: boolean;
  onStatusChange?: (v: string) => void;
  onGsmChange: (v: string) => void;
  onCompanyChange: (v: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <ModalShell open={props.open} title={props.title}>
      <form onSubmit={props.onSubmit} className="space-y-2">
        <SelectField
          label="GSM"
          value={props.gsmValue}
          onChange={props.onGsmChange}
          options={[{ value: "", label: "Select GSM" }].concat(
            props.gsmRows.map((g, idx) => ({
              value: String(g.id ?? ""),
              label: `${String(g.name ?? `GSM ${idx + 1}`)} (${String(g.ip_address ?? "-")})`,
            })),
          )}
        />
        <SelectField
          label="Company"
          value={props.companyValue}
          onChange={props.onCompanyChange}
          options={[{ value: "", label: "Select Company" }].concat(
            props.companyRows.map((c, idx) => ({
              value: String(c.id ?? ""),
              label: String(c.name ?? `Company ${idx + 1}`),
            })),
          )}
        />
        {props.showStatus ? (
          <SelectField
            label="Status"
            value={props.status ?? "active"}
            onChange={(v) => props.onStatusChange?.(v)}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={props.onClose} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700">Cancel</button>
          <button type="submit" className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-emerald-600">Assign</button>
        </div>
      </form>
    </ModalShell>
  );
}

function PortModal(props: {
  open: boolean;
  title: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  submitLabel: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <ModalShell open={props.open} title={props.title}>
      <form onSubmit={props.onSubmit} className="space-y-2">
        <SelectField
          label="Select Port"
          value={props.value}
          onChange={props.onChange}
          options={[{ value: "", label: "Select Port" }, ...props.options]}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={props.onClose} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700">Cancel</button>
          <button type="submit" className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-emerald-600">{props.submitLabel}</button>
        </div>
      </form>
    </ModalShell>
  );
}

function SmsModal(props: {
  open: boolean;
  value: { mobile: string; message: string; port: string };
  onChange: (v: { mobile: string; message: string; port: string }) => void;
  portOptions: Array<{ value: string; label: string }>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <ModalShell open={props.open} title="Send SMS">
      <form onSubmit={props.onSubmit} className="space-y-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Mobile Number</label>
          <input
            value={props.value.mobile}
            onChange={(e) => props.onChange({ ...props.value, mobile: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Message</label>
          <textarea
            rows={4}
            value={props.value.message}
            onChange={(e) => props.onChange({ ...props.value, message: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <SelectField
          label="Select Port (Optional)"
          value={props.value.port}
          onChange={(v) => props.onChange({ ...props.value, port: v })}
          options={[{ value: "", label: "Auto Select" }, ...props.portOptions]}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={props.onClose} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700">Cancel</button>
          <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Send SMS</button>
        </div>
      </form>
    </ModalShell>
  );
}

function UssdModal(props: {
  open: boolean;
  value: { text: string; port: string };
  onChange: (v: { text: string; port: string }) => void;
  portOptions: Array<{ value: string; label: string }>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <ModalShell open={props.open} title="Send USSD">
      <form onSubmit={props.onSubmit} className="space-y-2">
        <SelectField
          label="Port"
          value={props.value.port}
          onChange={(v) => props.onChange({ ...props.value, port: v })}
          options={[{ value: "", label: "Auto Select" }, ...props.portOptions]}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">USSD Code</label>
          <input
            value={props.value.text}
            onChange={(e) => props.onChange({ ...props.value, text: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={props.onClose} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700">Cancel</button>
          <button type="submit" className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white">Send USSD</button>
        </div>
      </form>
    </ModalShell>
  );
}
