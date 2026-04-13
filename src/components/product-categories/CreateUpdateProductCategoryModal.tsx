"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FormField, FormModal } from "@/components/crud/FormModal";
import { useProductCategory } from "@/hooks/product-categories/useProductCategory";
import { useProductCategories } from "@/hooks/product-categories/useProductCategories";
import { useProductCategoryMutations } from "@/hooks/product-categories/useProductCategoryMutations";
import { errorsFromAxios } from "@/lib/api/errorsFromAxios";
import { extractListRows, getApiData } from "@/lib/api/extractApiData";
import {
  showAppToast,
  showBillingBackendErrorToast,
} from "@/lib/toast/appToast";
import type { ProductCategory } from "@/models/ProductCategory";

type ParentRow = { id: number; name?: string };

const INITIAL = {
  name: "",
  description: "",
  parent_id: "" as string | number,
  is_active: true,
};

export function CreateUpdateProductCategoryModal({
  open,
  onClose,
  onSuccess,
  categoryId,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  categoryId: number | string | null;
}) {
  const isEdit = categoryId != null;
  const mutations = useProductCategoryMutations();
  const parentsQ = useProductCategories({ limit: 500 });
  const detailQ = useProductCategory(open && isEdit ? categoryId : null);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const parentRows = useMemo(() => {
    const { rows } = extractListRows<ParentRow>(parentsQ.data);
    return rows.filter((r) => r.id != null);
  }, [parentsQ.data]);

  const parentOptions = useMemo(() => {
    if (!isEdit || categoryId == null) return parentRows;
    const id = Number(categoryId);
    return parentRows.filter((r) => r.id !== id);
  }, [parentRows, isEdit, categoryId]);

  useEffect(() => {
    if (!open || !isEdit) return;
    const raw = getApiData(detailQ.data) as
      | (ProductCategory & Record<string, unknown>)
      | undefined;
    if (!raw) return;
    const pid = raw.parent_id;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from GET show
    setForm({
      name: String(raw.name ?? ""),
      description: raw.description != null ? String(raw.description) : "",
      parent_id:
        pid != null && Number.isFinite(Number(pid)) ? Number(pid) : "",
      is_active: raw.is_active !== false,
    });
    setErrors({});
  }, [open, isEdit, detailQ.data]);

  function handleClose() {
    setForm(INITIAL);
    setErrors({});
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    const name = form.name.trim();
    if (!name) {
      setErrors({ name: "Name is required" });
      return;
    }
    const parentId =
      form.parent_id === "" || form.parent_id === undefined
        ? null
        : Number(form.parent_id);
    const body: Record<string, unknown> = {
      name,
      is_active: form.is_active,
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      ...(parentId != null ? { parent_id: parentId } : { parent_id: null }),
    };
    try {
      if (isEdit && categoryId != null) {
        await mutations.update.mutateAsync({ id: categoryId, body });
        showAppToast("Category updated.", "success");
      } else {
        await mutations.create.mutateAsync(body);
        showAppToast("Category created.", "success");
      }
      setForm(INITIAL);
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (err) {
      const mapped = errorsFromAxios(err);
      setErrors(mapped);
      const hasField = Object.keys(mapped).some((k) => k !== "submit");
      if (!hasField) showBillingBackendErrorToast(err);
    }
  }

  const loading =
    mutations.create.isPending ||
    mutations.update.isPending ||
    (isEdit && detailQ.isPending);

  const inputErr = (field: string) =>
    errors[field]
      ? "border-rose-500 ring-1 ring-rose-500/30 dark:border-rose-600"
      : "";

  return (
    <FormModal
      open={open}
      title={
        isEdit ? "Update product category" : "Create product category"
      }
      onClose={handleClose}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? "Update category" : "Create category"}
      loading={loading}
      panelClassName="max-w-lg"
    >
      {errors.submit ? (
        <div
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100"
          role="alert"
        >
          {errors.submit}
        </div>
      ) : null}

      <FormField label="Name *">
        <input
          required
          name="name"
          className={`w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 ${inputErr("name")}`}
          value={form.name}
          onChange={(e) => {
            setForm((s) => ({ ...s, name: e.target.value }));
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
          placeholder="Enter category name"
          aria-invalid={!!errors.name}
        />
        {errors.name ? (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
            {errors.name}
          </p>
        ) : null}
      </FormField>

      <FormField label="Description">
        <textarea
          name="description"
          rows={3}
          className={`w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 ${inputErr("description")}`}
          value={form.description}
          onChange={(e) => {
            setForm((s) => ({ ...s, description: e.target.value }));
            if (errors.description)
              setErrors((prev) => ({ ...prev, description: "" }));
          }}
          placeholder="Enter category description"
          aria-invalid={!!errors.description}
        />
        {errors.description ? (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
            {errors.description}
          </p>
        ) : null}
      </FormField>

      <FormField label="Parent category">
        <select
          name="parent_id"
          className={`w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 ${inputErr("parent_id")}`}
          value={form.parent_id === "" ? "" : String(form.parent_id)}
          onChange={(e) => {
            setForm((s) => ({
              ...s,
              parent_id: e.target.value === "" ? "" : Number(e.target.value),
            }));
            if (errors.parent_id)
              setErrors((prev) => ({ ...prev, parent_id: "" }));
          }}
          aria-invalid={!!errors.parent_id}
        >
          <option value="">Root category</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name ?? `Category ${c.id}`}
            </option>
          ))}
        </select>
        {errors.parent_id ? (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
            {errors.parent_id}
          </p>
        ) : null}
      </FormField>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_active"
          checked={form.is_active}
          onChange={(e) => {
            setForm((s) => ({ ...s, is_active: e.target.checked }));
            if (errors.is_active)
              setErrors((prev) => ({ ...prev, is_active: "" }));
          }}
        />
        Active
      </label>
      {errors.is_active ? (
        <p className="text-xs text-rose-600 dark:text-rose-400">
          {errors.is_active}
        </p>
      ) : null}
    </FormModal>
  );
}
