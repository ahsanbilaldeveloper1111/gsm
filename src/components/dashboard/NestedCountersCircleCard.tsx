"use client";

import type { CounterMetricEntry } from "@/lib/dashboard/analyticsCounters";

function formatCircleValue(row: CounterMetricEntry): string {
  if (row.valueStyle === "currency") {
    return row.value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return Number(row.value).toLocaleString();
}

type NestedCountersCircleCardProps = {
  title: string;
  items: CounterMetricEntry[];
};

/**
 * One panel: title + metrics as circular badges (nested counters).
 */
export function NestedCountersCircleCard({
  title,
  items,
}: NestedCountersCircleCardProps) {
  if (items.length === 0) return null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-gradient-to-br from-white to-zinc-50/90 p-5 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_4px_24px_-8px_rgba(15,23,42,0.08)] ring-1 ring-zinc-900/[0.03] dark:border-zinc-800/70 dark:from-zinc-950 dark:to-zinc-950/85 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_6px_28px_-8px_rgba(0,0,0,0.35)] dark:ring-white/[0.04] sm:p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-400/12 to-teal-400/5 blur-3xl dark:from-emerald-500/10 dark:to-teal-600/10" />
      <h3 className="relative text-center text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-left">
        {title}
      </h3>
      <div className="relative mt-5 flex flex-wrap justify-center gap-5 sm:justify-start sm:gap-6">
        {items.map((row, i) => (
          <div
            key={row.key}
            className="flex flex-col items-center gap-2"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div
              className="flex h-[5.25rem] w-[5.25rem] shrink-0 items-center justify-center rounded-full border-[3px] border-emerald-400/45 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 shadow-[inset_0_2px_12px_rgba(16,185,129,0.08)] ring-2 ring-white/80 dark:border-emerald-600/35 dark:from-zinc-900 dark:via-emerald-950/25 dark:to-teal-950/20 dark:ring-zinc-800/80"
              aria-hidden
            >
              <span className="max-w-[4.5rem] px-1 text-center text-sm font-bold tabular-nums leading-tight text-zinc-900 dark:text-zinc-50 sm:text-base">
                {formatCircleValue(row)}
              </span>
            </div>
            <span className="max-w-[6.5rem] text-center text-[10px] font-semibold uppercase leading-snug tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
              {row.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
