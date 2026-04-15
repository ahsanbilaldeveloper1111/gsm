"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PaginatedDataTable } from "@/components/ui/PaginatedDataTable";
import {
  useNotificationById,
  useNotificationsByMobile,
  useNotifications,
  useNotificationStatisticsWithParams,
} from "@/hooks/notifications/useNotifications";
import { showAppToast, showBillingBackendErrorToast } from "@/lib/toast/appToast";
import { notificationsService } from "@/services/notifications.service";

type TabId = "list" | "statistics" | "by-mobile" | "send" | "show";

function formatDate(input?: string): string {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${mi}`;
}

function activeTabClass(active: boolean): string {
  return active
    ? "border-zinc-900 bg-zinc-900 text-white dark:border-emerald-600 dark:bg-emerald-600"
    : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200";
}

export function NotificationsModuleView() {
  const [activeTab, setActiveTab] = useState<TabId>("list");
  const [listPage, setListPage] = useState(1);
  const [listFilters, setListFilters] = useState({
    per_page: 15,
    mobile_number: "",
    tenant_id: "",
    extension: "",
    status: "",
    notification_type: "",
    date_from: "",
    date_to: "",
  });
  const [listDraft, setListDraft] = useState(listFilters);

  const [statsFilters, setStatsFilters] = useState({
    company_id: "",
    date_from: "",
    date_to: "",
  });

  const [mobileFilters, setMobileFilters] = useState({
    mobile_number: "+971509380627",
    status: "",
    notification_type: "",
  });
  const [mobileSearchEnabled, setMobileSearchEnabled] = useState(false);

  const [showId, setShowId] = useState<number | null>(null);
  const [showEnabled, setShowEnabled] = useState(false);

  const [sendForm, setSendForm] = useState({
    mobile_number: "+971509380627",
    message: "",
    tenant_id: "tenant123",
    extension: "ext001",
    notification_type: "sms",
    title: "",
  });

  const listParams = useMemo(
    () => ({
      page: listPage,
      per_page: listFilters.per_page,
      mobile_number: listFilters.mobile_number || undefined,
      tenant_id: listFilters.tenant_id || undefined,
      extension: listFilters.extension || undefined,
      status: listFilters.status || undefined,
      notification_type: listFilters.notification_type || undefined,
      date_from: listFilters.date_from || undefined,
      date_to: listFilters.date_to || undefined,
    }),
    [listFilters, listPage],
  );

  const notifications = useNotifications(listParams);
  const stats = useNotificationStatisticsWithParams({
    company_id: statsFilters.company_id || undefined,
    date_from: statsFilters.date_from || undefined,
    date_to: statsFilters.date_to || undefined,
  });
  const byMobile = useNotificationsByMobile(
    {
      mobile_number: mobileFilters.mobile_number || undefined,
      status: mobileFilters.status || undefined,
      notification_type: mobileFilters.notification_type || undefined,
      per_page: 15,
    },
    mobileSearchEnabled,
  );
  const byId = useNotificationById(showId, showEnabled);

  const sendMutation = useMutation({
    mutationFn: () =>
      notificationsService.sendSms({
        mobile_number: sendForm.mobile_number.trim(),
        message: sendForm.message.trim(),
        tenant_id: sendForm.tenant_id.trim(),
        extension: sendForm.extension.trim(),
        notification_type: sendForm.notification_type,
        title: sendForm.title.trim() || undefined,
      }),
    onSuccess: () => {
      showAppToast("Notification sent successfully", "success");
    },
    onError: showBillingBackendErrorToast,
  });

  const listRows = notifications.data?.rows ?? [];
  const listPg = notifications.data?.pagination;
  const listCurrent = listPg?.current_page ?? listPage;
  const listLast = listPg?.last_page ?? 1;
  const listTotal = listPg?.total ?? listRows.length;

  const byMobileRows = byMobile.data?.rows ?? [];
  const byMobileTotal = byMobile.data?.pagination?.total ?? byMobileRows.length;

  const statsData = (stats.data ?? {}) as Record<string, unknown>;
  const listColumns = useMemo(
    () => [
      { key: "id", header: "ID", render: (n: Record<string, unknown>) => String(n.id ?? "-") },
      { key: "mobile", header: "Mobile", render: (n: Record<string, unknown>) => String(n.mobile_number ?? "-") },
      { key: "message", header: "Message", render: (n: Record<string, unknown>) => String((n.message ?? "").toString().slice(0, 50)) },
      { key: "type", header: "Type", render: (n: Record<string, unknown>) => String(n.notification_type ?? "-") },
      { key: "status", header: "Status", render: (n: Record<string, unknown>) => String(n.status ?? "-") },
      { key: "sent_at", header: "Sent at", render: (n: Record<string, unknown>) => formatDate(String(n.sent_at ?? "")) },
      { key: "created_at", header: "Created", render: (n: Record<string, unknown>) => formatDate(String(n.created_at ?? "")) },
    ],
    [],
  );
  const byMobileColumns = useMemo(
    () => [
      { key: "id", header: "ID", render: (n: Record<string, unknown>) => String(n.id ?? "-") },
      { key: "message", header: "Message", render: (n: Record<string, unknown>) => String((n.message ?? "").toString().slice(0, 60)) },
      { key: "type", header: "Type", render: (n: Record<string, unknown>) => String(n.notification_type ?? "-") },
      { key: "status", header: "Status", render: (n: Record<string, unknown>) => String(n.status ?? "-") },
      { key: "sent_at", header: "Sent at", render: (n: Record<string, unknown>) => formatDate(String(n.sent_at ?? "")) },
      { key: "created_at", header: "Created", render: (n: Record<string, unknown>) => formatDate(String(n.created_at ?? "")) },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Notification API</h3>
        <button
          type="button"
          onClick={() => setActiveTab("send")}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-emerald-600"
        >
          Send notification
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ["list", "List"],
          ["statistics", "Statistics"],
          ["by-mobile", "By Mobile"],
          ["send", "Send SMS"],
          ["show", "View by ID"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id as TabId)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${activeTabClass(activeTab === id)}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "list" ? (
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
            List Notifications
          </h4>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5 xl:grid-cols-9">
            <SelectInput
              label="Per page"
              value={String(listDraft.per_page)}
              onChange={(v) => setListDraft((s) => ({ ...s, per_page: Number(v) }))}
              options={["15", "25", "50"]}
            />
            <TextInput
              label="Mobile"
              value={listDraft.mobile_number}
              onChange={(v) => setListDraft((s) => ({ ...s, mobile_number: v }))}
            />
            <TextInput
              label="Tenant ID"
              value={listDraft.tenant_id}
              onChange={(v) => setListDraft((s) => ({ ...s, tenant_id: v }))}
            />
            <TextInput
              label="Extension"
              value={listDraft.extension}
              onChange={(v) => setListDraft((s) => ({ ...s, extension: v }))}
            />
            <SelectInput
              label="Status"
              value={listDraft.status}
              onChange={(v) => setListDraft((s) => ({ ...s, status: v }))}
              options={["", "pending", "sent", "delivered", "failed"]}
            />
            <SelectInput
              label="Type"
              value={listDraft.notification_type}
              onChange={(v) => setListDraft((s) => ({ ...s, notification_type: v }))}
              options={["", "sms", "push"]}
            />
            <DateInput
              label="Date from"
              value={listDraft.date_from}
              onChange={(v) => setListDraft((s) => ({ ...s, date_from: v }))}
            />
            <DateInput
              label="Date to"
              value={listDraft.date_to}
              onChange={(v) => setListDraft((s) => ({ ...s, date_to: v }))}
            />
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setListPage(1);
                  setListFilters({ ...listDraft });
                }}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white dark:bg-emerald-600"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  const cleared = {
                    per_page: 15,
                    mobile_number: "",
                    tenant_id: "",
                    extension: "",
                    status: "",
                    notification_type: "",
                    date_from: "",
                    date_to: "",
                  };
                  setListDraft(cleared);
                  setListFilters(cleared);
                  setListPage(1);
                }}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-xs dark:border-zinc-700"
              >
                Clear
              </button>
            </div>
          </div>
          <PaginatedDataTable
            columns={listColumns}
            rows={listRows as Array<Record<string, unknown>>}
            isLoading={notifications.isPending}
            emptyMessage="No notifications"
            minWidthClassName="min-w-[64rem]"
            paginationMode="server"
            page={listCurrent}
            totalPages={listLast}
            totalRows={listTotal}
            perPage={listFilters.per_page}
            perPageOptions={[15, 25, 50]}
            onPageChange={setListPage}
            onPerPageChange={(next) => {
              setListDraft((s) => ({ ...s, per_page: next }));
              setListFilters((s) => ({ ...s, per_page: next }));
              setListPage(1);
            }}
            getRowKey={(row, idx) => String((row as Record<string, unknown>).id ?? idx)}
          />
        </div>
      ) : null}

      {activeTab === "statistics" ? (
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
            Notification Statistics
          </h4>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
            <TextInput
              label="Company ID"
              value={statsFilters.company_id}
              onChange={(v) => setStatsFilters((s) => ({ ...s, company_id: v }))}
            />
            <DateInput
              label="Date from"
              value={statsFilters.date_from}
              onChange={(v) => setStatsFilters((s) => ({ ...s, date_from: v }))}
            />
            <DateInput
              label="Date to"
              value={statsFilters.date_to}
              onChange={(v) => setStatsFilters((s) => ({ ...s, date_to: v }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <StatCard label="Total" value={statsData.total} />
            <StatCard label="Pending" value={statsData.pending} />
            <StatCard label="Sent" value={statsData.sent} />
            <StatCard label="Delivered" value={statsData.delivered} />
            <StatCard label="Failed" value={statsData.failed} />
          </div>
          <pre className="overflow-auto rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-900">
            {JSON.stringify(statsData.by_type ?? {}, null, 2)}
          </pre>
        </div>
      ) : null}

      {activeTab === "by-mobile" ? (
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
            Notifications by Mobile Number
          </h4>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
            <TextInput
              label="Mobile number"
              value={mobileFilters.mobile_number}
              onChange={(v) => setMobileFilters((s) => ({ ...s, mobile_number: v }))}
            />
            <SelectInput
              label="Status"
              value={mobileFilters.status}
              onChange={(v) => setMobileFilters((s) => ({ ...s, status: v }))}
              options={["", "pending", "sent", "delivered", "failed"]}
            />
            <SelectInput
              label="Type"
              value={mobileFilters.notification_type}
              onChange={(v) => setMobileFilters((s) => ({ ...s, notification_type: v }))}
              options={["", "sms", "push"]}
            />
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setMobileSearchEnabled(true)}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-emerald-600"
              >
                Search
              </button>
            </div>
          </div>
          <PaginatedDataTable
            columns={byMobileColumns}
            rows={byMobileRows as Array<Record<string, unknown>>}
            isLoading={byMobile.isPending}
            emptyMessage="No notifications"
            minWidthClassName="min-w-[56rem]"
            getRowKey={(row, idx) => String((row as Record<string, unknown>).id ?? idx)}
          />
          <p className="text-xs text-zinc-500">Total: {byMobileTotal}</p>
        </div>
      ) : null}

      {activeTab === "send" ? (
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
            Send Notification SMS
          </h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMutation.mutate();
            }}
            className="grid grid-cols-1 gap-2 md:grid-cols-2"
          >
            <TextInput
              label="Mobile number"
              value={sendForm.mobile_number}
              onChange={(v) => setSendForm((s) => ({ ...s, mobile_number: v }))}
            />
            <TextInput
              label="Tenant ID"
              value={sendForm.tenant_id}
              onChange={(v) => setSendForm((s) => ({ ...s, tenant_id: v }))}
            />
            <TextInput
              label="Extension"
              value={sendForm.extension}
              onChange={(v) => setSendForm((s) => ({ ...s, extension: v }))}
            />
            <SelectInput
              label="Notification type"
              value={sendForm.notification_type}
              onChange={(v) => setSendForm((s) => ({ ...s, notification_type: v }))}
              options={["sms", "push"]}
            />
            <TextInput
              label="Title"
              value={sendForm.title}
              onChange={(v) => setSendForm((s) => ({ ...s, title: v }))}
            />
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-zinc-600 dark:text-zinc-300">Message</label>
              <textarea
                value={sendForm.message}
                onChange={(e) => setSendForm((s) => ({ ...s, message: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={sendMutation.isPending}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-emerald-600"
              >
                Send SMS
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {activeTab === "show" ? (
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
            View Notification by ID
          </h4>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={showId ?? ""}
              onChange={(e) =>
                setShowId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="ID"
            />
            <button
              type="button"
              onClick={() => setShowEnabled(true)}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-emerald-600"
            >
              Fetch
            </button>
          </div>
          <pre className="overflow-auto rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-900">
            {byId.isPending
              ? "Loading..."
              : JSON.stringify(byId.data ?? { message: "No data" }, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-zinc-600 dark:text-zinc-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o || "All"}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextInput({
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
      <label className="mb-1 block text-xs text-zinc-600 dark:text-zinc-300">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
    </div>
  );
}

function DateInput({
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
      <label className="mb-1 block text-xs text-zinc-600 dark:text-zinc-300">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xl font-semibold">{String(value ?? "-")}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}

