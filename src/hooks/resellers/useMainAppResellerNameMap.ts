"use client";

import { useMemo } from "react";
import { extractListRows } from "@/lib/api/extractApiData";
import { useMainAppResellers } from "@/hooks/resellers/useMainAppResellers";
import {
  type MainAppResellerItem,
  mainAppResellerIdentifier,
} from "@/models/MainAppReseller";

/**
 * tenant_id / main-app identifier → display label (for company dropdowns, etc.).
 */
export function useMainAppResellerNameMap() {
  const q = useMainAppResellers({ limit: 500 });
  return useMemo(() => {
    const map: Record<string, string> = {};
    const { rows } = extractListRows<
      MainAppResellerItem & Record<string, unknown>
    >(q.data);
    for (const r of rows) {
      const id = mainAppResellerIdentifier(r);
      if (id) {
        map[id] = String(r.name ?? r.title ?? id).trim() || id;
      }
    }
    return map;
  }, [q.data]);
}
