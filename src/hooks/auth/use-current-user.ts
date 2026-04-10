"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchCurrentUser } from "@/services/auth.service";
import { useAuth } from "@/contexts/auth-context";

export function useCurrentUser() {
  const { token, isBootstrapping } = useAuth();
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: fetchCurrentUser,
    enabled: !isBootstrapping && !!token,
  });
}
