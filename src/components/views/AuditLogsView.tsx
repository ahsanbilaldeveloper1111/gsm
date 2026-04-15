"use client";

import { useMemo, useState } from "react";
import { RecordDetailModal } from "@/components/crud/RecordDetailModal";
import { PaginatedDataTable } from "@/components/ui/PaginatedDataTable";
import {
  useAuditLogById,
  useAuditLogResourceTypes,
  useAuditLogsList,
} from "@/hooks/audit-logs/useAuditLogs";
import type { IndexAuditLogParams } from "@/models/AuditLog";

function toLabel(input: string): string {
  return input.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function actionChipClass(action?: string): string {
  const a = (action ?? "").toLowerCase();
  if (a === "create" || a === "created") return "bg-emerald-100 text-emerald-800";
  if (a === "update" || a === "updated") return "bg-amber-100 text-amber-900";
  if (a === "delete" || a === "deleted") return "bg-rose-100 text-rose-800";
  if (a === "send_notification") return "bg-sky-100 text-sky-800";
  return "bg-zinc-100 text-zinc-700";
}

type Filters = {
  search: string;
  action: string;
  resourceType: string;
  tenantId: string;
  perPage: number;
  page: number;
};

const initialFilters: Filters = {
  search: "",
  action: "",
  resourceType: "",
  tenantId: "",
  perPage: 10,
  page: 1,
};

export function AuditLogsView() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [searchDraft, setSearchDraft] = useState("");
  const [actionDraft, setActionDraft] = useState("");
  const [resourceTypeDraft, setResourceTypeDraft] = useState("");
  const [tenantIdDraft, setTenantIdDraft] = useState("");
  const [selectedId, setSelectedId] = useState<number | string | null>(null);

  const params = useMemo<IndexAuditLogParams>(
    () => ({
      page: filters.page,
      per_page: filters.perPage,
      search: filters.search || undefined,
      action: filters.action || undefined,
      resource_type: filters.resourceType || undefined,
      tenant_id: filters.tenantId || undefined,
    }),
    [filters],
  );

  const logsQuery = useAuditLogsList(params);
  const typesQuery = useAuditLogResourceTypes();
  const detailsQuery = useAuditLogById(selectedId);

  const rows = logsQuery.data?.data?.data ?? [];
  const summary = logsQuery.data?.summary;
  const currentPage = logsQuery.data?.data?.current_page ?? filters.page;
  const lastPage = logsQuery.data?.data?.last_page ?? 1;
  const total = logsQuery.data?.data?.total ?? 0;

  const resourceTypes = typesQuery.data?.data ?? [];
  const columns = useMemo(
    () => [
      {
        key: "created_at",
        header: "Created at",
        render: (log: (typeof rows)[number]) =>
          log.formatted_timestamp ?? new Date(log.created_at).toLocaleString(),
      },
      {
        key: "user",
        header: "User",
        render: (log: (typeof rows)[number]) => log.user_name || log.user?.name || "N/A",
      },
      {
        key: "action",
        header: "Action",
        render: (log: (typeof rows)[number]) => (
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${actionChipClass(log.action)}`}
          >
            {log.formatted_action ?? toLabel(log.action)}
          </span>
        ),
      },
      {
        key: "resource_type",
        header: "Resource type",
        render: (log: (typeof rows)[number]) =>
          log.formatted_resource_type ?? toLabel(log.resource_type),
      },
      {
        key: "changes",
        header: "Changes",
        render: (log: (typeof rows)[number]) =>
          `${Array.isArray(log.changes_summary) ? log.changes_summary.length : 0} changes`,
      },
      {
        key: "ip",
        header: "IP address",
        render: (log: (typeof rows)[number]) => log.ip_address || "-",
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        render: (log: (typeof rows)[number]) => (
          <div className="text-right">
            <button
              type="button"
              onClick={() => setSelectedId(log.id)}
              className="rounded-lg bg-zinc-900 px-2 py-1 text-xs font-medium text-white dark:bg-emerald-600"
            >
              View Details
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  function applyFilters() {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      search: searchDraft.trim(),
      action: actionDraft,
      resourceType: resourceTypeDraft,
      tenantId: tenantIdDraft.trim(),
    }));
  }

  function clearFilters() {
    setSearchDraft("");
    setActionDraft("");
    setResourceTypeDraft("");
    setTenantIdDraft("");
    setFilters(initialFilters);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Logs" value={summary?.total ?? 0} />
        <SummaryCard title="Created" value={summary?.created ?? 0} />
        <SummaryCard title="Updated" value={summary?.updated ?? 0} />
        <SummaryCard title="Deleted" value={summary?.deleted ?? 0} />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
          <select
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={actionDraft}
            onChange={(e) => setActionDraft(e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="create">Created</option>
            <option value="update">Updated</option>
            <option value="delete">Deleted</option>
            <option value="send_notification">Send Notification</option>
          </select>

          <select
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={resourceTypeDraft}
            onChange={(e) => setResourceTypeDraft(e.target.value)}
          >
            <option value="">All Resource Types</option>
            {resourceTypes.map((t) => (
              <option key={t} value={t}>
                {toLabel(t)}
              </option>
            ))}
          </select>

          <input
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="Tenant ID"
            value={tenantIdDraft}
            onChange={(e) => setTenantIdDraft(e.target.value)}
          />

          <input
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="Search by user, company"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters();
            }}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-emerald-600"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Page {currentPage} of {lastPage} (Total: {total})
          </p>
          <select
            className="rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={String(filters.perPage)}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                page: 1,
                perPage: Number(e.target.value),
              }))
            }
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/50">
        <PaginatedDataTable
          columns={columns}
          rows={rows}
          isLoading={logsQuery.isPending}
          emptyMessage="No audit logs found"
          minWidthClassName="min-w-[70rem]"
          paginationMode="server"
          page={currentPage}
          totalPages={lastPage}
          totalRows={total}
          perPage={filters.perPage}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          onPerPageChange={(perPage) =>
            setFilters((prev) => ({ ...prev, page: 1, perPage }))
          }
          getRowKey={(row) => String(row.id)}
        />
      </div>

      <RecordDetailModal
        open={selectedId != null}
        title="Audit log details"
        subtitle="Detailed immutable change history for this event."
        data={
          detailsQuery.data?.data
            ? {
                success: true as const,
                data: detailsQuery.data.data as unknown as Record<string, unknown>,
              }
            : null
        }
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}
