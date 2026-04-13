"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import { companyService } from "@/services/company.service";

export function useCompanyDocuments(tenantId: string | null | undefined) {
  const auth = useAuthQueryEnabled();
  const enabled =
    auth && tenantId != null && String(tenantId).trim() !== "";
  return useQuery({
    queryKey: queryKeys.company.documents(tenantId ?? null),
    queryFn: () => companyService.listDocuments(tenantId as string),
    enabled,
  });
}
