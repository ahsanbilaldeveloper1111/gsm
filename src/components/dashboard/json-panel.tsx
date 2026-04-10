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
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
      >
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
          ) : null}
        </div>
        <span className="text-zinc-400">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <pre className="max-h-80 overflow-auto border-t border-zinc-100 bg-zinc-50/80 p-4 text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-black/40 dark:text-zinc-300">
          {text}
        </pre>
      ) : null}
    </div>
  );
}
