"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexUserParams } from "@/models/User";
import { fetchUsers } from "@/services/users.service";

export function useUsers(params?: IndexUserParams | null) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.users.list(
      (params as Record<string, unknown> | null) ?? null,
    ),
    queryFn: () => fetchUsers(params ?? undefined),
    enabled,
  });
}
