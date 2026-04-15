"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { queryKeys } from "@/lib/queryKeys";
import { appPaths } from "@/lib/navigation/appPaths";
import type { LoginPayload } from "@/services/auth.service";
import { loginRequest, logoutRequest } from "@/services/auth.service";

/**
 * Login and logout via React Query mutations (services stay here, not in context).
 * JWT is stored in an HTTP-only cookie by the Next proxy; session shape comes from `/user` (see `useCurrentUser`).
 */
export function useAuthSessionMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => loginRequest(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const login = useCallback(
    (payload: LoginPayload) => loginMutation.mutateAsync(payload),
    [loginMutation],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      /* Proxy clears the http-only JWT cookie when logout succeeds. */
    } finally {
      router.replace(appPaths.login);
    }
  }, [logoutMutation, router]);

  return {
    loginMutation,
    logoutMutation,
    login,
    logout,
  };
}
