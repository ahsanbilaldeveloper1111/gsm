"use client";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  /** Optional second line highlighting what will be removed (e.g. record name). */
  itemName?: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  /** Text shown on the confirm button while `loading` is true. */
  loadingActionLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  itemName,
  confirmLabel = "Confirm",
  danger = false,
  loading,
  loadingActionLabel = "Working…",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/45 backdrop-blur-sm dark:bg-black/55"
        aria-label="Dismiss"
        onClick={onCancel}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="flex items-start justify-between gap-3">
          <h3
            id="confirm-dialog-title"
            className="text-base font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {title}
          </h3>
          <button
            type="button"
            className="shrink-0 rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Close"
            onClick={onCancel}
          >
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </button>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
        {itemName != null && itemName !== "" ? (
          <p className="mt-3 text-sm">
            <span className="font-semibold text-rose-700 dark:text-rose-400">
              Item to delete:{" "}
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {itemName}
            </span>
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
              danger
                ? "bg-rose-600 hover:bg-rose-500"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {loading ? loadingActionLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
