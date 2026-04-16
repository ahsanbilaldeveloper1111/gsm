"use client";

import { useState } from "react";

type JsonPanelProps = {
  title: string;
  subtitle?: string;
  data: unknown;
  defaultOpen?: boolean;
};

export function JsonPanel({
  title,
  subtitle,
  data,
  defaultOpen = false,
}: JsonPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const text =
    data === undefined || data === null
      ? String(data)
      : JSON.stringify(data, null, 2);

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200/60 bg-gradient-to-br from-white/95 via-zinc-50/40 to-emerald-50/15 shadow-[0_8px_32px_-16px_rgba(15,23,42,0.1)] ring-1 ring-zinc-900/[0.04] dark:border-zinc-800/70 dark:from-zinc-950/95 dark:via-zinc-950/80 dark:to-emerald-950/10 dark:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.45)] dark:ring-white/[0.05]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"
      >
        <div className="min-w-0">
          <h3 className="font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-100">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          ) : null}
        </div>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-white/80 text-sm text-zinc-500 shadow-sm transition dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-400 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open ? (
        <pre className="max-h-80 overflow-auto border-t border-zinc-200/60 bg-gradient-to-b from-zinc-50/95 to-zinc-100/40 p-5 font-mono text-[11px] leading-relaxed text-zinc-700 dark:border-zinc-800/80 dark:from-zinc-950/90 dark:to-black/40 dark:text-zinc-300">
          {text}
        </pre>
      ) : null}
    </div>
  );
}
