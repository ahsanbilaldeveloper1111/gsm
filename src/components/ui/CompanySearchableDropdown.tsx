"use client";

import { useMemo } from "react";
import { useCompanies } from "@/hooks/company/useCompanies";
import { extractListRows } from "@/lib/api/extractApiData";
import type { IndexCompanyParams } from "@/models/Company";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

export type CompanyDropdownRow = Record<string, unknown> & {
  id?: number | string;
  name?: string;
};

export type CompanySearchableDropdownProps = {
  value: string | null | undefined;
  onChange: (companyId: string) => void;
  onCompanyChange?: (company: CompanyDropdownRow | null) => void;
  rows?: CompanyDropdownRow[];
  fetchParams?: Partial<IndexCompanyParams>;
  enabled?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  controlClassName?: string;
  isClearable?: boolean;
  selectLike?: boolean;
  loadingText?: string;
  emptyText?: string;
  listClearLabel?: string;
  listMaxHeightClass?: string;
};

/**
 * Generic searchable company picker by `company.id`.
 * Accepts preloaded rows when the parent already has them; otherwise it fetches.
 */
export function CompanySearchableDropdown({
  value,
  onChange,
  onCompanyChange,
  rows,
  fetchParams,
  enabled = true,
  placeholder = "Select company",
  ariaLabel,
  className,
  controlClassName,
  isClearable = true,
  selectLike = false,
  loadingText = "Loading companies…",
  emptyText = "No companies",
  listClearLabel,
  listMaxHeightClass,
}: CompanySearchableDropdownProps) {
  const shouldFetch = rows == null;
  const companiesQuery = useCompanies(
    shouldFetch
      ? ({ page: 1, limit: 2000, ...(fetchParams ?? {}) } as IndexCompanyParams)
      : undefined,
    { enabled: shouldFetch && enabled },
  );

  const companyRows = useMemo(() => {
    const source =
      rows ?? extractListRows<CompanyDropdownRow>(companiesQuery.data).rows;
    return source
      .filter((row) => row.id != null && String(row.id).trim() !== "")
      .sort((a, b) =>
        String(a.name ?? a.id ?? "").localeCompare(String(b.name ?? b.id ?? "")),
      );
  }, [companiesQuery.data, rows]);

  const options = useMemo(
    () =>
      companyRows.map((row, idx) => ({
        value: String(row.id),
        label: String(row.name ?? `Company ${idx + 1}`),
      })),
    [companyRows],
  );

  return (
    <SearchableSelect
      value={value}
      onChange={(next) => {
        const companyId = next ?? "";
        onChange(companyId);
        onCompanyChange?.(
          companyRows.find((row) => String(row.id) === companyId) ?? null,
        );
      }}
      options={options}
      placeholder={placeholder}
      ariaLabel={ariaLabel ?? placeholder}
      className={className}
      controlClassName={controlClassName}
      isClearable={isClearable}
      selectLike={selectLike}
      loading={shouldFetch ? companiesQuery.isPending : false}
      loadingText={loadingText}
      emptyText={emptyText}
      listClearLabel={listClearLabel}
      listMaxHeightClass={listMaxHeightClass}
      disabled={!enabled}
    />
  );
}
