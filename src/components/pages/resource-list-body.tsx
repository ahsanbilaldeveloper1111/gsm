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
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900"
          />
        ))}
      </div>
    );
  }
  if (query.isError) {
    return (
      <div
        className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-100"
        role="alert"
      >
        {String(query.error)}
      </div>
    );
  }
  const text =
    query.data === undefined || query.data === null
      ? emptyMessage
      : JSON.stringify(query.data, null, 2);
  return (
    <pre className="max-h-[min(70vh,520px)] overflow-auto rounded-xl border border-zinc-200/80 bg-white p-4 text-xs leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
      {text}
    </pre>
  );
}
