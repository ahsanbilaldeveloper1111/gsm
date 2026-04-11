"use client";

import { useAuth } from "@/contexts/auth-context";

/** Use as `enabled` for React Query calls that require JWT. */
export function useAuthQueryEnabled(): boolean {
  const { token } = useAuth();
  return !!token;
}
