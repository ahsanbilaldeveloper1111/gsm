"use client";

import type { UseQueryResult } from "@tanstack/react-query";

export function ResourceListBody({
  query,
  emptyMessage = "No data returned.",
}: {
  query: UseQueryResult<unknown>;
  emptyMessage?: string;
}) {
  if (query.isPending) {
    return (
      <div className="space-y-3 rounded-2xl border border-zinc-200/60 bg-white/50 p-4 dark:border-zinc-800/60 dark:bg-zinc-950/40">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded-md bg-gradient-to-r from-zinc-100 via-zinc-200/80 to-zinc-100 dark:from-zinc-800 dark:via-zinc-700/50 dark:to-zinc-800"
            style={{ width: `${100 - i * 12}%` }}
          />
        ))}
      </div>
    );
  }
  if (query.isError) {
    return (
      <div
        className="rounded-2xl border border-rose-200/90 bg-gradient-to-br from-rose-50 to-white p-5 text-sm text-rose-900 shadow-sm dark:border-rose-900/50 dark:from-rose-950/40 dark:to-zinc-950 dark:text-rose-100"
        role="alert"
      >
        <p className="font-semibold">Request failed</p>
        <p className="mt-2 font-mono text-xs opacity-90">{String(query.error)}</p>
      </div>
    );
  }
  const text =
    query.data === undefined || query.data === null
      ? emptyMessage
      : JSON.stringify(query.data, null, 2);
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-zinc-950/[0.02] shadow-inner ring-1 ring-black/[0.03] dark:border-zinc-800/80 dark:bg-black/20 dark:ring-white/[0.05]">
      <div className="border-b border-zinc-200/60 bg-zinc-100/50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
        <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Response
        </span>
      </div>
      <pre className="max-h-[min(70vh,560px)] overflow-auto p-4 font-mono text-[11px] leading-relaxed text-zinc-800 dark:text-zinc-200">
        {text}
      </pre>
    </div>
  );
}
