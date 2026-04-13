"use client";

import { useMemo } from "react";
import { extractListRows } from "@/lib/api/extractApiData";
import { useMainAppResellers } from "@/hooks/resellers/useMainAppResellers";
import {
  type MainAppResellerItem,
  mainAppResellerIdentifier,
} from "@/models/MainAppReseller";

export type MainAppResellerDropdownProps = {
  /** Current value (tenant_id / identifier from main app). */
  value: string | null | undefined;
  /** Called when selection changes; receives tenant_id string or null. */
  onChange: (tenantId: string | null) => void;
  /** Optional: called with full vendor object when user selects one. */
  onSelectReseller?: (reseller: MainAppResellerItem | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Optional fetch params for list (e.g. limit, search). */
  fetchParams?: Record<string, unknown>;
  isClearable?: boolean;
};

const selectCls =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

/**
 * Dropdown that loads reseller/vendor rows from the main app (`GET /resellers/from-main-app`)
 * and selects by tenant identifier.
 */
export function MainAppResellerDropdown({
  value,
  onChange,
  onSelectReseller,
  placeholder = "Select vendor from main app",
  disabled = false,
  className = "",
  fetchParams = {},
  isClearable = true,
}: MainAppResellerDropdownProps) {
  const q = useMainAppResellers(fetchParams);

  const list = useMemo((): MainAppResellerItem[] => {
    const { rows } = extractListRows<MainAppResellerItem & Record<string, unknown>>(
      q.data,
    );
    return rows;
  }, [q.data]);

  const options = useMemo(() => {
    return list
      .map((r) => {
        const id = mainAppResellerIdentifier(r);
        const label = r.name ?? r.title ?? id;
        return {
          value: id,
          label: id ? `${label} (${id})` : label,
        };
      })
      .filter((o) => o.value !== "");
  }, [list]);

  const loading = q.isPending;

  const handleChange = (raw: string) => {
    const tenantId = raw === "" ? null : raw;
    onChange(tenantId);
    if (onSelectReseller) {
      const reseller =
        tenantId != null
          ? list.find((r) => mainAppResellerIdentifier(r) === tenantId) ??
            null
          : null;
      onSelectReseller(reseller);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-zinc-500 ${className}`}
      >
        <span
          className="inline-block size-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent"
          aria-hidden
        />
        <span>Loading vendors…</span>
      </div>
    );
  }

  return (
    <select
      className={`${selectCls} ${className}`}
      value={value ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      disabled={disabled}
      aria-label={placeholder}
    >
      {isClearable ? (
        <option value="">{placeholder}</option>
      ) : null}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default MainAppResellerDropdown;
