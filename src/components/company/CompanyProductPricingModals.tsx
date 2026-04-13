"use client";

import type { ProductPricingRow } from "@/lib/company/productPricingHelpers";
import type { Product } from "@/models/Product";

type BulkUpdateModalProps = {
  open: boolean;
  onClose: () => void;
  discountPercent: string;
  onDiscountPercentChange: (v: string) => void;
  onApply: () => void;
  busy: boolean;
  selectedCount: number;
};

export function BulkUpdateModal({
  open,
  onClose,
  discountPercent,
  onDiscountPercentChange,
  onApply,
  busy,
  selectedCount,
}: BulkUpdateModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm dark:bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Bulk update pricing
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Apply a percentage reduction to the selling price of{" "}
          <strong>{selectedCount}</strong> selected product(s).
        </p>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Discount (%)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={discountPercent}
          onChange={(e) => onDiscountPercentChange(e.target.value)}
          placeholder="e.g. 10"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || selectedCount === 0}
            onClick={onApply}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy ? "Applying…" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}

type DeletePricingModalProps = {
  open: boolean;
  item: ProductPricingRow | null;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
};

export function DeletePricingModal({
  open,
  item,
  onClose,
  onConfirm,
  busy,
}: DeletePricingModalProps) {
  if (!open || !item) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm dark:bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">
          Delete product pricing?
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Remove pricing for <strong>{item.product_name}</strong>. This cannot be
          undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

type AddProductPricingModalProps = {
  open: boolean;
  onClose: () => void;
  products: Product[];
  productId: string;
  onProductIdChange: (v: string) => void;
  sellingPrice: string;
  onSellingPriceChange: (v: string) => void;
  onSubmit: () => void;
  busy: boolean;
};

export function AddProductPricingModal({
  open,
  onClose,
  products,
  productId,
  onProductIdChange,
  sellingPrice,
  onSellingPriceChange,
  onSubmit,
  busy,
}: AddProductPricingModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm dark:bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Add product pricing
        </h3>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Product
        </label>
        <select
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={productId}
          onChange={(e) => onProductIdChange(e.target.value)}
        >
          <option value="">Select product…</option>
          {products.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name} (base {p.base_price})
            </option>
          ))}
        </select>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Selling price
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={sellingPrice}
          onChange={(e) => onSellingPriceChange(e.target.value)}
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !productId}
            onClick={onSubmit}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

type AddDiscountModalProps = {
  open: boolean;
  onClose: () => void;
  discountType: "percentage" | "amount";
  onDiscountTypeChange: (v: "percentage" | "amount") => void;
  percentage: string;
  onPercentageChange: (v: string) => void;
  amount: string;
  onAmountChange: (v: string) => void;
  productId: string;
  onProductIdChange: (v: string) => void;
  products: Product[];
  onSubmit: () => void;
  busy: boolean;
};

export function AddDiscountModal({
  open,
  onClose,
  discountType,
  onDiscountTypeChange,
  percentage,
  onPercentageChange,
  amount,
  onAmountChange,
  productId,
  onProductIdChange,
  products,
  onSubmit,
  busy,
}: AddDiscountModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm dark:bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Add discount applicability
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Creates a discount rule linked to a product. Exact fields depend on the
          billing API.
        </p>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Product (optional)
        </label>
        <select
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={productId}
          onChange={(e) => onProductIdChange(e.target.value)}
        >
          <option value="">Any / not set</option>
          {products.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Type
        </label>
        <select
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={discountType}
          onChange={(e) =>
            onDiscountTypeChange(
              e.target.value === "amount" ? "amount" : "percentage",
            )
          }
        >
          <option value="percentage">Percentage</option>
          <option value="amount">Fixed amount</option>
        </select>
        {discountType === "percentage" ? (
          <>
            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Percentage off
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={percentage}
              onChange={(e) => onPercentageChange(e.target.value)}
            />
          </>
        ) : (
          <>
            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Amount off
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
            />
          </>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onSubmit}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
