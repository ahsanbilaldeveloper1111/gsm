"use client";

import type { ReactNode } from "react";
import type { ApiPagination } from "@/lib/api/types";

type CollapsibleFilterPanelProps = {
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function CollapsibleFilterPanel({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: CollapsibleFilterPanelProps) {
  return (
    <div className="mb-4 space-y-3 rounded-2xl border border-zinc-200/80 bg-white/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2 text-left dark:border-zinc-700 dark:bg-zinc-900/60"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          {subtitle ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          ) : null}
        </div>
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open ? children : null}
    </div>
  );
}

type TableListHeaderControlsProps = {
  title: string;
  pagination?: ApiPagination;
  rowCount: number;
  limit: number;
  limitOptions: readonly number[];
  onLimitChange: (limit: number) => void;
};

export function TableListHeaderControls({
  title,
  pagination,
  rowCount,
  limit,
  limitOptions,
  onLimitChange,
}: TableListHeaderControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/60 bg-zinc-50/80 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
          {title}
        </span>
        {pagination ? (
          <span className="ml-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            Page {pagination.page} of {pagination.last_page} · {pagination.total} total
          </span>
        ) : (
          <span className="ml-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            {rowCount} row{rowCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
      <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
        Per page
        <select
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
          value={limit}
          onChange={(ev) => onLimitChange(Number(ev.target.value))}
        >
          {limitOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

type TablePaginationControlsProps = {
  pagination?: ApiPagination;
  onPageChange: (page: number) => void;
};

export function TablePaginationControls({
  pagination,
  onPageChange,
}: TablePaginationControlsProps) {
  if (!pagination || pagination.last_page <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        disabled={pagination.page <= 1}
        onClick={() => onPageChange(pagination.page - 1)}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900"
      >
        Previous
      </button>
      <label className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        Page
        <select
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={pagination.page}
          onChange={(ev) => onPageChange(Number(ev.target.value))}
        >
          {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(
            (pageNum) => (
              <option key={pageNum} value={pageNum}>
                {pageNum}
              </option>
            ),
          )}
        </select>
        <span>/ {pagination.last_page}</span>
      </label>
      <button
        type="button"
        disabled={pagination.page >= pagination.last_page}
        onClick={() => onPageChange(pagination.page + 1)}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900"
      >
        Next
      </button>
    </div>
  );
}
