"use client";

import type { ReactNode } from "react";

type FormModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  loading?: boolean;
  /** Panel width (default `max-w-lg`). Use e.g. `max-w-2xl` for two-column forms. */
  panelClassName?: string;
};

export function FormModal({
  open,
  title,
  children,
  onClose,
  onSubmit,
  submitLabel = "Save",
  loading,
  panelClassName,
}: FormModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm dark:bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 ${panelClassName ?? "max-w-lg"}`}
      >
        <div className="border-b border-zinc-200/70 px-5 py-3 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Close
            </button>
          </div>
        </div>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="space-y-4 px-5 py-4">{children}</div>
          <div className="flex justify-end gap-2 border-t border-zinc-200/70 px-5 py-3 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium dark:border-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? "Saving…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
