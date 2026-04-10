"use client";

import { useAuth } from "@/contexts/auth-context";

/** Use as `enabled` for React Query calls that require JWT after bootstrap. */
export function useAuthQueryEnabled(): boolean {
  const { token, isBootstrapping } = useAuth();
  return !isBootstrapping && !!token;
}
