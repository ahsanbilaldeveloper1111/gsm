"use client";

import { useEffect } from "react";
import type { TelecomPagination } from "@/lib/api/telecomResponse";
import type { IndexGsmParams } from "@/models/Gsm";

/** Load enough GSM rows for filter dropdowns when the index API is paginated. */
export const gsmDropdownListParams: IndexGsmParams = {
  page: 1,
  perPage: 500,
};

export function deriveTotalsFromTelecomPagination(
  pagination: TelecomPagination | undefined,
  rowsLength: number,
  perPage: number,
): { totalRows: number; totalPages: number } {
  const totalRows =
    pagination?.total ??
    pagination?.recordsFiltered ??
    pagination?.recordsTotal ??
    rowsLength;
  let totalPages = 1;
  if (pagination?.last_page != null && pagination.last_page >= 1) {
    totalPages = pagination.last_page;
  } else if (typeof pagination?.total === "number" && perPage > 0) {
    totalPages = Math.max(1, Math.ceil(pagination.total / perPage));
  } else {
    totalPages = Math.max(1, Math.ceil(totalRows / Math.max(perPage, 1)));
  }
  return { totalRows, totalPages };
}

/** DataTables-style paging (`start` / `length`) from UI page index (1-based). */
export function dataTablesPaging(page: number, perPage: number) {
  const safePage = Math.max(1, page);
  const len = Math.max(1, perPage);
  return {
    draw: 1,
    start: (safePage - 1) * len,
    length: len,
  };
}

/**
 * Laravel `LengthAwarePaginator` query params (`page`, `perPage`), e.g.
 * `$request->input('page', 1)` and `$request->input('perPage', 15)`.
 */
export function laravelPageParams(page: number, perPage: number) {
  const safePage = Math.max(1, page);
  const len = Math.max(1, perPage);
  return { page: safePage, perPage: len };
}

export function useClampPageToLastPage(
  lastPage: number | undefined,
  page: number,
  setPage: (n: number) => void,
) {
  useEffect(() => {
    if (typeof lastPage === "number" && lastPage >= 1 && page > lastPage) {
      setPage(lastPage);
    }
  }, [lastPage, page, setPage]);
}
