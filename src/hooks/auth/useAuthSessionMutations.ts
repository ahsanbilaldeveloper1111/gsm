"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getStoredToken } from "@/lib/auth/tokenStore";
import { queryKeys } from "@/lib/queryKeys";
import type { LoginPayload } from "@/services/auth.service";
import { loginRequest, logoutRequest } from "@/services/auth.service";

type SetToken = (token: string | null) => void;

/**
 * Login and logout via React Query mutations (services stay here, not in context).
 * JWT comes only from login / 2FA flows — `expires_in` is stored for client-side session checks.
 */
export function useAuthSessionMutations(setToken: SetToken) {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => loginRequest(payload),
    onSuccess: async () => {
      setToken(getStoredToken());
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      setToken(null);
    },
  });

  const login = useCallback(
    (payload: LoginPayload) => loginMutation.mutateAsync(payload),
    [loginMutation],
  );

  const logout = useCallback(
    () => logoutMutation.mutateAsync(),
    [logoutMutation],
  );

  return {
    loginMutation,
    logoutMutation,
    login,
    logout,
  };
}
