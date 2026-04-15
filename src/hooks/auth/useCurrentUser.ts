"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/services/auth.service";
import { queryKeys } from "@/lib/queryKeys";

function isNonRetryableAuthError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const s = error.response?.status;
  return s === 401 || s === 403;
}

/**
 * Current user profile. Uses the same-origin proxy; JWT is http-only. On 401 or 403, `apiClient` may
 * retry once after `POST /get-token` before surfacing an error.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: fetchCurrentUser,
    enabled: true,
    retry: (failureCount, error) => {
      if (isNonRetryableAuthError(error)) return false;
      return failureCount < 3;
    },
  });
}
