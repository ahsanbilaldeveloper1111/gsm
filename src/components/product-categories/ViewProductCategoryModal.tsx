"use client";

import type { ReactNode } from "react";
import { useProductCategory } from "@/hooks/product-categories/useProductCategory";
import { getApiData } from "@/lib/api/extractApiData";
import type { ProductCategory } from "@/models/ProductCategory";

type ViewProductCategoryModalProps = {
  show: boolean;
  onHide: () => void;
  categoryId: number | string | null;
  onEdit?: (category: ProductCategory) => void;
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{children}</div>
    </div>
  );
}

function parentLine(c: ProductCategory & Record<string, unknown>): string {
  const p = c.parent;
  if (p && typeof p === "object" && typeof p.name === "string" && p.name.trim()) {
    return p.name;
  }
  return "Root category";
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ViewProductCategoryModal({
  show,
  onHide,
  categoryId,
  onEdit,
}: ViewProductCategoryModalProps) {
  const q = useProductCategory(show ? categoryId : null);
  const c = getApiData(q.data) as
    | (ProductCategory & Record<string, unknown>)
    | undefined;

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm dark:bg-black/60"
        aria-label="Close"
        onClick={onHide}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200/70 px-5 py-3 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Product category
            </h2>
            <div className="flex gap-2">
              {onEdit && c ? (
                <button
                  type="button"
                  onClick={() => {
                    onHide();
                    onEdit(c);
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  Edit
                </button>
              ) : null}
              <button
                type="button"
                onClick={onHide}
                className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-y-auto px-5 py-4">
          {q.isPending ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : q.isError ? (
            <p className="text-sm text-rose-600">{String(q.error)}</p>
          ) : c ? (
            <>
              <Field label="Name">{c.name ?? "—"}</Field>
              <Field label="Description">
                {c.description?.trim() ? String(c.description) : "—"}
              </Field>
              <Field label="Parent">{parentLine(c)}</Field>
              <Field label="Active">
                {c.is_active !== false ? "Yes" : "No"}
              </Field>
              <Field label="Created">{formatDate(c.created_at)}</Field>
              <Field label="Updated">{formatDate(c.updated_at)}</Field>
            </>
          ) : (
            <p className="text-sm text-zinc-500">No data.</p>
          )}
        </div>
      </div>
    </div>
  );
}
