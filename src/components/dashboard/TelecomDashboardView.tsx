"use client";

import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  DashboardMutedBadge,
  DashboardStatusBadge,
  DashboardTableScroll,
  dashboardTable,
} from "@/components/dashboard/DashboardDataTable";
import {
  coerceInboxByDays,
  profilingRowsFromDashboard,
  telecomDashboardMetricCards,
  type DashboardGsmPortsChart,
  type TelecomDashboardData,
} from "@/models/TelecomDashboard";

function formatDateTime(input?: string | null): string {
  if (input == null || input === "") return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDayLabel(input?: string | null): string {
  if (input == null || input === "") return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span
        className="mt-0.5 h-10 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-emerald-400 via-teal-500 to-cyan-500 shadow-[0_0_16px_-2px_rgba(16,185,129,0.55)] ring-2 ring-emerald-400/20"
        aria-hidden
      />
      <div className="min-w-0">
        <h3 className="relative pb-1.5 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
          <span className="absolute bottom-0 left-0 h-0.5 w-16 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 opacity-90 shadow-sm shadow-emerald-500/30" />
        </h3>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function PortStatusChip({ status }: { status: string }) {
  const s = status.toLowerCase();
  const active =
    s.includes("ok") || s.includes("online") || s.includes("register");
  return (
    <span
      className={`inline-flex max-w-full truncate rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
        active
          ? "bg-emerald-100/90 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200"
          : "bg-amber-100/90 text-amber-950 dark:bg-amber-950/50 dark:text-amber-100"
      }`}
    >
      {status}
    </span>
  );
}

function GsmPortsUsageChart({ chart }: { chart: DashboardGsmPortsChart }) {
  const { used_ports: used, free_ports: free, gsm_names: names } = chart;
  if (!Array.isArray(used) || !Array.isArray(free) || !Array.isArray(names)) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Invalid chart data.</p>
    );
  }
  const n = Math.min(used.length, free.length, names.length);
  if (n === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">No GSM port usage data.</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3 py-1 dark:border-emerald-800/50 dark:bg-emerald-950/40">
          <span className="h-2 w-4 rounded bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm" aria-hidden />
          In use
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-zinc-100/80 px-3 py-1 dark:border-zinc-700 dark:bg-zinc-800/60">
          <span className="h-2 w-4 rounded bg-zinc-400 dark:bg-zinc-500" aria-hidden />
          Free
        </span>
      </div>
      <ul className="space-y-3">
        {Array.from({ length: n }, (_, i) => {
          const u = Math.max(0, Number(used[i]) || 0);
          const f = Math.max(0, Number(free[i]) || 0);
          const total = u + f || 1;
          const uPct = (u / total) * 100;
          const label = names[i] != null ? String(names[i]) : `GSM ${i + 1}`;
          return (
            <li
              key={i}
              className="rounded-xl border border-zinc-200/60 bg-white/60 p-3 shadow-sm transition hover:border-emerald-200/80 hover:shadow-md dark:border-zinc-800/70 dark:bg-zinc-900/40 dark:hover:border-emerald-800/50"
            >
              <div className="mb-2 flex justify-between gap-2 text-xs">
                <span className="truncate font-mono font-medium text-zinc-700 dark:text-zinc-200" title={label}>
                  {label}
                </span>
                <DashboardMutedBadge>
                  {u} / {u + f} ports
                </DashboardMutedBadge>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-zinc-200/90 ring-1 ring-zinc-900/[0.06] dark:bg-zinc-800 dark:ring-white/[0.05]">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                  style={{ width: `${uPct}%` }}
                  title={`In use: ${u}`}
                />
                <div
                  className="bg-zinc-300 dark:bg-zinc-600"
                  style={{ width: `${100 - uPct}%` }}
                  title={`Free: ${f}`}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function InboxByDaysChart({ rows }: { rows: ReturnType<typeof coerceInboxByDays> }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">No inbox activity for this range.</p>
    );
  }
  const counts = rows.map((r) => {
    const c = r.count;
    if (typeof c === "number" && Number.isFinite(c)) return c;
    if (typeof c === "string") {
      const n = Number.parseInt(c, 10);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  });
  const max = Math.max(...counts, 1);

  return (
    <div className="space-y-5">
      <div className="flex h-40 items-end gap-1.5 rounded-xl border border-zinc-200/50 bg-gradient-to-b from-sky-50/50 to-transparent px-2 pb-2 pt-4 dark:border-zinc-800/60 dark:from-indigo-950/30">
        {rows.map((row, i) => {
          const h = (counts[i]! / max) * 100;
          return (
            <div
              key={`${row.date ?? i}-${i}`}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
            >
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  className="w-full max-w-[52px] rounded-t-lg bg-gradient-to-t from-indigo-600 via-sky-500 to-cyan-400 shadow-[0_-4px_16px_-4px_rgba(14,165,233,0.35)] ring-1 ring-white/20 dark:from-indigo-500 dark:via-sky-600 dark:to-cyan-500"
                  style={{ height: `${Math.max(h, 6)}%` }}
                  title={`${counts[i]} messages`}
                />
              </div>
              <span className="max-w-full truncate text-center text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                {formatDayLabel(row.date)}
              </span>
              <span className="rounded-md bg-zinc-900/5 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-zinc-800 dark:bg-white/5 dark:text-zinc-100">
                {counts[i]}
              </span>
            </div>
          );
        })}
      </div>
      <DashboardTableScroll>
        <table className={dashboardTable.table}>
          <thead>
            <tr className={dashboardTable.theadRow}>
              <th className={dashboardTable.th}>Date</th>
              <th className={`${dashboardTable.th} text-right`}>Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.date ?? i}-${i}`} className={dashboardTable.trBody}>
                <td className={`${dashboardTable.td} font-mono text-xs text-zinc-600 dark:text-zinc-300`}>
                  {row.date ?? "—"}
                </td>
                <td className={`${dashboardTable.td} text-right`}>
                  <DashboardMutedBadge>{counts[i]}</DashboardMutedBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DashboardTableScroll>
    </div>
  );
}

export function TelecomDashboardView({ data }: { data: TelecomDashboardData }) {
  const metrics = telecomDashboardMetricCards(data);
  const assignments = Array.isArray(data.gsm_assignment) ? data.gsm_assignment : [];
  const inboxList = Array.isArray(data.inbox_list) ? data.inbox_list : [];
  const profiling = profilingRowsFromDashboard(data);
  const chart = data.gsm_ports_chart;
  const inboxByDays = coerceInboxByDays(data.inbox_items_by_days);

  const maxGsm = Math.max(0, ...profiling.map((r) => Number(r.gsm_count) || 0), 1);
  const maxPort = Math.max(0, ...profiling.map((r) => Number(r.port_count) || 0), 1);

  const chartOk =
    chart &&
    Array.isArray(chart.used_ports) &&
    Array.isArray(chart.free_ports) &&
    Array.isArray(chart.gsm_names);

  return (
    <div className="relative space-y-16">
      <div
        className="pointer-events-none absolute -left-24 -right-24 -top-28 h-72 overflow-hidden opacity-90"
        aria-hidden
      >
        <div className="absolute left-1/4 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-400/25 via-teal-300/15 to-transparent blur-3xl dark:from-emerald-500/20 dark:via-teal-500/10" />
        <div className="absolute right-0 top-8 h-56 w-56 rounded-full bg-gradient-to-bl from-violet-400/20 via-fuchsia-300/10 to-transparent blur-3xl dark:from-violet-500/15" />
        <div className="absolute bottom-0 left-1/3 h-px w-[min(100%,48rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent dark:via-emerald-600/25" />
      </div>

      <div className="relative">
        <SectionTitle
          title="Overview"
          subtitle="Live totals from your telecom workspace."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {metrics.map((m, i) => (
            <MetricCard key={m.key} label={m.label} value={m.value} accent={i} />
          ))}
        </div>
      </div>

      <section className="rounded-3xl border border-zinc-200/60 bg-gradient-to-br from-white/90 via-zinc-50/30 to-teal-50/20 p-6 shadow-[0_4px_32px_-14px_rgba(15,23,42,0.1)] backdrop-blur-sm dark:border-zinc-800/70 dark:from-zinc-950/90 dark:via-zinc-950/50 dark:to-emerald-950/10 dark:shadow-[0_8px_40px_-16px_rgba(0,0,0,0.5)] sm:p-8">
        <SectionTitle
          title="Top GSM assignments"
          subtitle="Latest GSM–company links with port breakdown."
        />
        {assignments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200/80 bg-zinc-50/50 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
            No assignment rows.
          </p>
        ) : (
          <DashboardTableScroll minWidthClassName="min-w-[760px]">
            <table className={dashboardTable.table}>
              <thead>
                <tr className={dashboardTable.theadRow}>
                  <th className={dashboardTable.th}>Company</th>
                  <th className={dashboardTable.th}>GSM</th>
                  <th className={dashboardTable.th}>IP</th>
                  <th className={dashboardTable.th}>Device</th>
                  <th className={`${dashboardTable.th} text-right`}>Ports</th>
                  <th className={dashboardTable.th}>Assigned ports</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((row) => (
                  <tr
                    key={row.id ?? `${row.gsm_ip}-${row.company_name}`}
                    className={`${dashboardTable.trBody} align-top`}
                  >
                    <td className={`${dashboardTable.td} font-medium text-zinc-900 dark:text-zinc-50`}>
                      {row.company_name ?? "—"}
                    </td>
                    <td className={dashboardTable.td}>{row.gsm_name ?? "—"}</td>
                    <td className={`${dashboardTable.td} font-mono text-xs text-zinc-600 dark:text-zinc-300`}>
                      {row.gsm_ip ?? "—"}
                    </td>
                    <td className={dashboardTable.td}>
                      {row.device_status ? (
                        <DashboardStatusBadge>{String(row.device_status)}</DashboardStatusBadge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={`${dashboardTable.td} text-right`}>
                      <div className="flex flex-col items-end gap-1">
                        <span className="tabular-nums text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                          {row.assigned_ports_count ?? 0}{" "}
                          <span className="font-normal text-zinc-400">/</span>{" "}
                          {row.total_ports ?? 0}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {row.unassigned_ports_count ?? 0} unassigned
                        </span>
                      </div>
                    </td>
                    <td className={dashboardTable.td}>
                      <div className="flex max-w-[220px] flex-wrap gap-1.5">
                        {(row.assigned_ports_data ?? []).map((p, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200/80 bg-zinc-50/90 px-2 py-1 font-mono text-[11px] dark:border-zinc-700 dark:bg-zinc-900/60"
                          >
                            <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                              {p.port_number != null ? String(p.port_number) : "—"}
                            </span>
                            {p.status != null ? <PortStatusChip status={String(p.status)} /> : null}
                          </span>
                        ))}
                        {(row.assigned_ports_data ?? []).length === 0 ? (
                          <span className="text-zinc-400">—</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DashboardTableScroll>
        )}
      </section>

      <section className="rounded-3xl border border-zinc-200/60 bg-gradient-to-br from-white/90 via-zinc-50/30 to-sky-50/15 p-6 shadow-[0_4px_32px_-14px_rgba(15,23,42,0.1)] backdrop-blur-sm dark:border-zinc-800/70 dark:from-zinc-950/90 dark:via-zinc-950/50 dark:to-sky-950/10 dark:shadow-[0_8px_40px_-16px_rgba(0,0,0,0.5)] sm:p-8">
        <SectionTitle
          title="Inbox preview"
          subtitle="Most recent inbound messages."
        />
        {inboxList.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200/80 bg-zinc-50/50 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
            No recent messages.
          </p>
        ) : (
          <DashboardTableScroll>
            <table className={dashboardTable.table}>
              <thead>
                <tr className={dashboardTable.theadRow}>
                  <th className={dashboardTable.th}>When</th>
                  <th className={dashboardTable.th}>IP</th>
                  <th className={dashboardTable.th}>Port</th>
                  <th className={dashboardTable.th}>Mobile</th>
                  <th className={dashboardTable.th}>Message</th>
                </tr>
              </thead>
              <tbody>
                {inboxList.map((row, i) => (
                  <tr key={i} className={dashboardTable.trBody}>
                    <td className={`${dashboardTable.td} whitespace-nowrap text-xs text-zinc-600 dark:text-zinc-400`}>
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className={`${dashboardTable.td} font-mono text-xs`}>{row.ip_address ?? "—"}</td>
                    <td className={`${dashboardTable.td} font-mono text-xs`}>
                      {row.port_number != null ? String(row.port_number) : "—"}
                    </td>
                    <td className={`${dashboardTable.td} font-mono text-xs`}>
                      {row.mobile_number != null ? String(row.mobile_number) : "—"}
                    </td>
                    <td className={`${dashboardTable.td} max-w-md`}>
                      <span
                        className="line-clamp-3 rounded-md bg-zinc-50/80 px-2 py-1.5 text-xs leading-relaxed text-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200"
                        title={row.message ?? undefined}
                      >
                        {row.message ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DashboardTableScroll>
        )}
      </section>

      <section className="rounded-3xl border border-zinc-200/60 bg-gradient-to-br from-white/90 via-zinc-50/30 to-violet-50/15 p-6 shadow-[0_4px_32px_-14px_rgba(15,23,42,0.1)] backdrop-blur-sm dark:border-zinc-800/70 dark:from-zinc-950/90 dark:via-zinc-950/50 dark:to-violet-950/10 dark:shadow-[0_8px_40px_-16px_rgba(0,0,0,0.5)] sm:p-8">
        <SectionTitle
          title="Company profiling"
          subtitle="Top companies by GSM and port footprint."
        />
        {profiling.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200/80 bg-zinc-50/50 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
            No profiling rows.
          </p>
        ) : (
          <DashboardTableScroll>
            <table className={dashboardTable.table}>
              <thead>
                <tr className={dashboardTable.theadRow}>
                  <th className={dashboardTable.th}>Company</th>
                  <th className={`${dashboardTable.th} text-right`}>GSM</th>
                  <th className={`${dashboardTable.th} text-right`}>Ports</th>
                </tr>
              </thead>
              <tbody>
                {profiling.map((row, i) => {
                  const g = Number(row.gsm_count) || 0;
                  const p = Number(row.port_count) || 0;
                  return (
                    <tr key={`${row.company ?? i}-${i}`} className={dashboardTable.trBody}>
                      <td className={`${dashboardTable.td} font-semibold text-zinc-900 dark:text-zinc-50`}>
                        {row.company ?? "—"}
                      </td>
                      <td className={`${dashboardTable.td} text-right`}>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="tabular-nums text-sm font-bold">{g}</span>
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200/90 dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                              style={{ width: `${(g / maxGsm) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className={`${dashboardTable.td} text-right`}>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="tabular-nums text-sm font-bold">{p}</span>
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200/90 dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                              style={{ width: `${(p / maxPort) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </DashboardTableScroll>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-zinc-200/60 bg-gradient-to-br from-white/90 via-emerald-50/20 to-transparent p-6 shadow-[0_4px_32px_-14px_rgba(15,23,42,0.1)] dark:border-zinc-800/70 dark:from-zinc-950/90 dark:via-emerald-950/15 sm:p-8">
          <SectionTitle
            title="GSM port usage"
            subtitle="Used vs free ports by device IP."
          />
          {chartOk ? (
            <GsmPortsUsageChart chart={chart} />
          ) : (
            <p className="rounded-xl border border-dashed border-zinc-200/80 bg-zinc-50/50 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
              No chart data.
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-zinc-200/60 bg-gradient-to-br from-white/90 via-sky-50/20 to-transparent p-6 shadow-[0_4px_32px_-14px_rgba(15,23,42,0.1)] dark:border-zinc-800/70 dark:from-zinc-950/90 dark:via-sky-950/15 sm:p-8">
          <SectionTitle
            title="Inbox by day"
            subtitle="Message volume in the last 7 days."
          />
          <InboxByDaysChart rows={inboxByDays} />
        </section>
      </div>
    </div>
  );
}
