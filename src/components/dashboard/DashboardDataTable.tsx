"use client";

import type { ReactNode } from "react";

type DashboardTableScrollProps = {
  children: ReactNode;
  /** Min width for wide tables (e.g. assignments). */
  minWidthClassName?: string;
};

/**
 * Framed scroll region for dashboard tables — gradient header band, soft shadow, ring.
 */
export function DashboardTableScroll({
  children,
  minWidthClassName = "min-w-full",
}: DashboardTableScrollProps) {
  return (
    <div className="group/table overflow-hidden rounded-2xl border border-zinc-200/70 bg-gradient-to-br from-white via-zinc-50/50 to-emerald-50/[0.4] shadow-[0_8px_32px_-16px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-zinc-900/[0.04] dark:border-zinc-800/80 dark:from-zinc-950 dark:via-zinc-950/95 dark:to-emerald-950/[0.14] dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] dark:ring-white/[0.05]">
      <div
        className={`relative overflow-x-auto shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ${minWidthClassName}`}
      >
        {children}
      </div>
    </div>
  );
}

const theadRowClass =
  "bg-gradient-to-r from-zinc-100/95 via-white to-teal-50/40 dark:from-zinc-900/95 dark:via-zinc-950 dark:to-emerald-950/30";

const thClass =
  "border-b border-zinc-200/90 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-600 first:pl-5 last:pr-5 dark:border-zinc-700/80 dark:text-zinc-400";

const tdClass =
  "border-b border-zinc-100/90 px-4 py-3 align-middle text-zinc-800 first:pl-5 last:pr-5 dark:border-zinc-800/70 dark:text-zinc-100";

const trBodyClass =
  "transition-colors odd:bg-white/70 even:bg-zinc-50/50 hover:bg-emerald-50/50 dark:odd:bg-zinc-950/40 dark:even:bg-zinc-900/35 dark:hover:bg-emerald-950/25";

export const dashboardTable = {
  theadRow: theadRowClass,
  th: thClass,
  td: tdClass,
  trBody: trBodyClass,
  table: "w-full border-collapse text-sm",
};

/** Compact pill for device / port status strings. */
export function DashboardStatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-100">
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Neutral badge for counts / secondary labels. */
export function DashboardMutedBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-zinc-200/80 bg-zinc-100/80 px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200">
      {children}
    </span>
  );
}
