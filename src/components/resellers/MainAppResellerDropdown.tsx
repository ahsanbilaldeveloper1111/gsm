"use client";

import { useMemo } from "react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
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

/**
 * Dropdown that loads reseller/vendor rows from the main app (`GET /resellers/from-main-app`)
 * and selects by tenant identifier (searchable Select2-style UI).
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

  const handleChange = (tenantId: string | null) => {
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

  return (
    <SearchableSelect
      value={value ?? null}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      loading={loading}
      isClearable={isClearable}
      className={className}
      ariaLabel={placeholder}
      loadingText="Loading vendors…"
      emptyText="No vendors found"
    />
  );
}

export default MainAppResellerDropdown;
