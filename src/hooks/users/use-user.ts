"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/query-keys";
import { fetchUser } from "@/services/users.service";

export function useUser(
  id: number | string | null | undefined,
  params?: QueryParams,
) {
  const auth = useAuthQueryEnabled();
  const enabled = auth && id != null && id !== "";
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? null),
    queryFn: () => fetchUser(id as number | string, params),
    enabled,
  });
}
