"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { fetchCurrentUser } from "@/services/auth.service";
import { queryKeys } from "@/lib/queryKeys";

function isNonRetryableAuthError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const s = error.response?.status;
  return s === 401 || s === 403;
}

/**
 * Current user profile. **401** / **403** from `apiClient` redirect to `/login` globally (`axiosClient` response interceptor).
 */
export function useCurrentUser() {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: fetchCurrentUser,
    enabled: !!token,
    retry: (failureCount, error) => {
      if (isNonRetryableAuthError(error)) return false;
      return failureCount < 3;
    },
  });
}
