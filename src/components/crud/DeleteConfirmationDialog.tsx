"use client";

import { ConfirmDialog } from "@/components/crud/ConfirmDialog";

export type DeleteConfirmationDialogProps = {
  /** When `false`, the dialog is not shown. */
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  /** Shown in emphasis below `message` (e.g. vendor name, invoice #). */
  itemName?: string;
  isDeleting?: boolean;
};

/**
 * Generic delete confirmation — use for every destructive delete action.
 * Wraps `ConfirmDialog` with delete-appropriate defaults and copy.
 */
export function DeleteConfirmationDialog({
  show,
  onHide,
  onConfirm,
  title = "Confirm delete",
  message = "Are you sure you want to delete this item? This cannot be undone.",
  itemName,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  return (
    <ConfirmDialog
      open={show}
      title={title}
      message={message}
      itemName={itemName}
      confirmLabel="Delete"
      danger
      loading={isDeleting}
      loadingActionLabel="Deleting…"
      onConfirm={onConfirm}
      onCancel={onHide}
    />
  );
}
