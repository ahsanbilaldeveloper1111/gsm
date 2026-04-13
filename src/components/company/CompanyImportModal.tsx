"use client";

import type { ChangeEvent } from "react";
import { useRef, useState } from "react";

type CompanyImportModalProps = {
  open: boolean;
  onClose: () => void;
  isPending: boolean;
  onImport: (file: File) => Promise<void>;
};

export function CompanyImportModal({
  open,
  onClose,
  isPending,
  onImport,
}: CompanyImportModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      await onImport(file);
      onClose();
    } catch {
      setError("Import failed. Check the file format and try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-import-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm dark:bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-2">
          <h2
            id="company-import-title"
            className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
          >
            Import companies
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Upload a CSV that matches the billing template (name, email, phone,
          address, payment fields, currency, tax, vendor_name, …).
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="mt-4 block w-full text-sm"
          disabled={isPending}
          onChange={onFileChange}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {isPending ? "Importing…" : "Choose CSV file"}
          </button>
        </div>
        {error ? (
          <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
