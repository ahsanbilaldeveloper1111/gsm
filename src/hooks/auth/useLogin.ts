"use client";

import { useAuth } from "@/contexts/auth-context";

/** React Query login mutation (single source: `useAuthSessionMutations`). */
export function useLogin() {
  const { loginMutation } = useAuth();
  return loginMutation;
}
