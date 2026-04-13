"use client";

import type { ReactNode } from "react";
import { formatCellValue } from "@/lib/api/extractApiData";

function DetailBlock({ data, depth = 0 }: { data: unknown; depth?: number }) {
  if (data === null || data === undefined) {
    return <span className="text-zinc-400">—</span>;
  }
  if (typeof data !== "object") {
    return <span className="text-zinc-800 dark:text-zinc-100">{formatCellValue(data)}</span>;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-zinc-400">[]</span>;
    }
    return (
      <ul className="space-y-2">
        {data.map((item, i) => (
          <li
            key={i}
            className="rounded-lg border border-zinc-200/70 bg-white/60 px-3 py-2 dark:border-zinc-800/80 dark:bg-zinc-950/40"
          >
            <DetailBlock data={item} depth={depth + 1} />
          </li>
        ))}
      </ul>
    );
  }
  const o = data as Record<string, unknown>;
  const entries = Object.entries(o).filter(([k]) => !k.startsWith("_"));
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-xl border border-zinc-200/50 bg-gradient-to-br from-zinc-50/90 to-white px-3 py-2.5 dark:border-zinc-800/60 dark:from-zinc-900/50 dark:to-zinc-950/60"
        >
          <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
            {key.replace(/_/g, " ")}
          </dt>
          <dd className="mt-1.5 text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100">
            {typeof value === "object" && value !== null ? (
              <div className="mt-2 border-l-2 border-emerald-500/35 pl-3">
                <DetailBlock data={value} depth={depth + 1} />
              </div>
            ) : (
              formatCellValue(value)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type RecordDetailModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  /** Unwrapped entity or full API payload — nested objects are rendered as cards. */
  data: unknown;
  onClose: () => void;
  /** Rendered below the detail tree (e.g. invoice payment UI). */
  afterBody?: ReactNode;
};

export function RecordDetailModal({
  open,
  title,
  subtitle,
  loading,
  error,
  data,
  onClose,
  afterBody,
}: RecordDetailModalProps) {
  if (!open) return null;

  const inner =
    data &&
    typeof data === "object" &&
    "data" in (data as object) &&
    (data as { success?: unknown }).success === true
      ? (data as { data: unknown }).data
      : data;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crud-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm transition-opacity dark:bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200/70 bg-gradient-to-r from-emerald-50/90 to-teal-50/40 px-5 py-4 dark:border-zinc-800 dark:from-emerald-950/40 dark:to-zinc-950">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="crud-detail-title"
                className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 hover:bg-white/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              Close
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
                  style={{ width: `${100 - i * 8}%` }}
                />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          ) : inner == null ? (
            <p className="text-sm text-zinc-500">No data.</p>
          ) : (
            <>
              <DetailBlock data={inner} />
              {afterBody}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
