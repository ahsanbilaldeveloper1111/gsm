"use client";

import { useMemo } from "react";
import { useCrmCompanies } from "@/hooks/crm/useCrmCompanies";
import { extractListRows } from "@/lib/api/extractApiData";
import type { QueryParams } from "@/lib/api/http";
import type { CrmCompany } from "@/models/CrmCompany";

/**
 * CRM company id → display name (from GET /crm/companies).
 */
export function useCrmCompanyNameMap(params: QueryParams = {}) {
  const q = useCrmCompanies({ limit: 1000, ...params });
  return useMemo(() => {
    const map: Record<string, string> = {};
    const { rows } = extractListRows<CrmCompany & Record<string, unknown>>(
      q.data,
    );
    for (const c of rows) {
      const name = (c?.name ?? "").trim() || "—";
      const id = c?.id ?? c.company_id;
      if (id != null) {
        map[String(id)] = name;
      }
    }
    return map;
  }, [q.data]);
}
