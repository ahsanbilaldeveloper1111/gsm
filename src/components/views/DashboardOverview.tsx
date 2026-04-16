"use client";

import { useMemo, useState } from "react";
import { JsonPanel } from "@/components/dashboard/JsonPanel";
import { TelecomDashboardView } from "@/components/dashboard/TelecomDashboardView";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useCompanies } from "@/hooks/company/useCompanies";
import { useDashboardParams } from "@/hooks/dashboard/useDashboardParams";
import { useGsm } from "@/hooks/gsm/useGsm";
import { extractListRows } from "@/lib/api/extractApiData";
import { unwrapDashboardApiPayload } from "@/lib/dashboard/unwrapAnalyticsPayload";
import type { QueryParams } from "@/lib/api/http";
import type { Company } from "@/models/Company";
import { parseTelecomDashboardData } from "@/models/TelecomDashboard";

const EMPTY_DASHBOARD_PARAMS: QueryParams = {};

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M7 12h10M10 18h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-zinc-200/90 bg-white/90 px-4 py-2.5 text-sm shadow-sm transition placeholder:text-zinc-400 focus:border-emerald-400/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 dark:border-zinc-700/90 dark:bg-zinc-900/80 dark:placeholder:text-zinc-500 dark:focus:border-emerald-500/70 dark:focus:ring-emerald-500/20";

export function DashboardOverview() {
  const [company, setCompany] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [gsmId, setGsmId] = useState("");

  const companiesQuery = useCompanies({ page: 1, limit: 2000 });
  const gsmQuery = useGsm({ page: 1, perPage: 500 });

  const companyRows = useMemo(() => {
    const { rows } = extractListRows<Company & Record<string, unknown>>(companiesQuery.data);
    return rows.filter((r) => r.id != null);
  }, [companiesQuery.data]);

  const companyOptions = useMemo(() => {
    return companyRows
      .map((r) => ({
        value: String(r.id),
        label: r.name?.trim() ? String(r.name) : String(r.id),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [companyRows]);

  const gsmOptions = useMemo(() => {
    const rows = gsmQuery.data?.rows ?? [];
    return rows
      .filter((g) => g.id != null && String(g.id).trim() !== "")
      .map((g) => ({
        value: String(g.id),
        label: [g.name, g.ip_address].filter(Boolean).join(" · ") || String(g.id),
      }));
  }, [gsmQuery.data]);

  const dashboardParams = useMemo((): QueryParams => {
    const c = company.trim();
    const cid = companyId.trim();
    const gid = gsmId.trim();
    if (!c && !cid && !gid) return EMPTY_DASHBOARD_PARAMS;
    const p: QueryParams = {};
    if (c) p.company = c;
    if (cid) p.company_id = cid;
    if (gid) p.gsm_id = gid;
    return p;
  }, [company, companyId, gsmId]);

  const dashboardQuery = useDashboardParams(dashboardParams);

  const dashboardData = useMemo(() => {
    const raw = unwrapDashboardApiPayload(dashboardQuery.data);
    return parseTelecomDashboardData(raw) ?? {};
  }, [dashboardQuery.data]);

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[2rem]"
        aria-hidden
      >
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-300/20 via-teal-200/10 to-transparent blur-3xl dark:from-emerald-600/15 dark:via-teal-600/10" />
        <div className="absolute -right-24 bottom-32 h-72 w-72 rounded-full bg-gradient-to-bl from-violet-400/15 via-fuchsia-300/8 to-transparent blur-3xl dark:from-violet-600/12" />
      </div>

      <section className="relative z-30 overflow-visible rounded-3xl border border-white/60 bg-gradient-to-br from-white/95 via-emerald-50/35 to-teal-50/25 p-6 shadow-[0_12px_48px_-20px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] ring-1 ring-zinc-900/[0.04] backdrop-blur-md dark:border-zinc-800/70 dark:from-zinc-950/95 dark:via-emerald-950/20 dark:to-teal-950/15 dark:shadow-[0_20px_60px_-24px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.05)] dark:ring-white/[0.06] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 overflow-hidden rounded-full bg-gradient-to-br from-emerald-400/25 to-transparent blur-3xl dark:from-emerald-500/15" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-emerald-300/35 to-transparent dark:via-emerald-600/20" />

        <div className="relative mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-white/30 dark:ring-emerald-400/20">
              <FilterIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Scope your view
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Optional filters for{" "}
                <code className="rounded-md bg-zinc-900/5 px-1.5 py-0.5 font-mono text-xs text-emerald-800 dark:bg-white/10 dark:text-emerald-300">
                  GET /api/dashboard
                </code>
                . Leave empty for the full workspace.
              </p>
            </div>
          </div>
        </div>

        <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* <div className="group">
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
              <span className="h-1 w-1 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              Company identifier
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. tenant slug or ID"
              className={inputClassName}
            />
          </div> */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
              <span className="h-1 w-1 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
              Company ID
            </label>
            <SearchableSelect
              value={companyId || null}
              onChange={(id) => {
                const next = id ?? "";
                setCompanyId(next);
                if (!next) return;
                const row = companyRows.find((r) => String(r.id) === next) as
                  | (Company & Record<string, unknown>)
                  | undefined;
                const ident = row?.identifier;
                if (typeof ident === "string" && ident.trim()) {
                  setCompany(ident.trim());
                }
              }}
              options={companyOptions}
              placeholder="All companies"
              listClearLabel="Any company — no filter"
              loading={companiesQuery.isPending}
              isClearable
              selectLike
              controlClassName={inputClassName}
              ariaLabel="Company ID"
              loadingText="Loading companies…"
              emptyText="No companies"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
              <span className="h-1 w-1 rounded-full bg-violet-500 shadow-sm shadow-violet-500/50" />
              GSM ID
            </label>
            <SearchableSelect
              value={gsmId || null}
              onChange={(id) => setGsmId(id ?? "")}
              options={gsmOptions}
              placeholder="All GSM devices"
              listClearLabel="Any GSM — no filter"
              loading={gsmQuery.isPending}
              isClearable
              selectLike
              controlClassName={inputClassName}
              ariaLabel="GSM ID"
              loadingText="Loading GSM…"
              emptyText="No GSM devices"
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 mt-10 overflow-hidden rounded-[1.75rem] border border-zinc-200/55 bg-gradient-to-b from-white/80 via-white/50 to-zinc-50/30 p-6 shadow-[0_16px_56px_-28px_rgba(15,23,42,0.15)] ring-1 ring-zinc-900/[0.03] backdrop-blur-sm dark:border-zinc-800/60 dark:from-zinc-950/90 dark:via-zinc-950/70 dark:to-zinc-950/40 dark:shadow-[0_24px_64px_-28px_rgba(0,0,0,0.55)] dark:ring-white/[0.05] sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(16,185,129,0.10),transparent_55%)] dark:bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(16,185,129,0.08),transparent_55%)]"
          aria-hidden
        />

        {dashboardQuery.isLoading ? (
          <div className="relative space-y-10">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl bg-gradient-to-br from-zinc-100/95 via-white to-emerald-50/25 dark:from-zinc-800 dark:via-zinc-900 dark:to-emerald-950/20"
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          </div>
        ) : dashboardQuery.isError ? (
          <div className="relative rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-white px-6 py-8 text-center dark:border-rose-900/50 dark:from-rose-950/40 dark:to-zinc-950">
            <p className="font-semibold text-rose-800 dark:text-rose-200">Could not load dashboard</p>
            <p className="mt-2 text-sm text-rose-600/90 dark:text-rose-300/90">
              {dashboardQuery.error instanceof Error
                ? dashboardQuery.error.message
                : "Something went wrong. Try again or check your connection."}
            </p>
          </div>
        ) : (
          <TelecomDashboardView data={dashboardData} />
        )}
      </section>

      <div className="mt-10">
        <JsonPanel
          title="GET /api/dashboard — raw response"
          subtitle="Full JSON body for debugging."
          data={dashboardQuery.data}
          defaultOpen={false}
        />
      </div>
    </div>
  );
}
