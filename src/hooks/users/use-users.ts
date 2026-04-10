"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import { fetchUsers } from "@/services/users.service";

export function useUsers(
  params?: Record<string, string | number | boolean | undefined>,
) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.users.list(params ?? null),
    queryFn: () => fetchUsers(params),
    enabled,
  });
}
