"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getStoredToken } from "@/lib/auth/tokenStore";
import { queryKeys } from "@/lib/queryKeys";
import type { LoginPayload } from "@/services/auth.service";
import { loginRequest, logoutRequest } from "@/services/auth.service";
import { bootstrapTokenFromServer } from "@/services/token.service";

type SetToken = (token: string | null) => void;

/**
 * Bootstrap, login, and logout via React Query mutations (services stay here, not in context).
 */
export function useAuthSessionMutations(setToken: SetToken) {
  const queryClient = useQueryClient();

  const bootstrapMutation = useMutation({
    mutationFn: bootstrapTokenFromServer,
    onSuccess: (jwt) => {
      setToken(jwt);
    },
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => loginRequest(payload),
    onSuccess: async () => {
      setToken(getStoredToken());
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
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

  const refreshServerToken = useCallback(
    () => bootstrapMutation.mutateAsync(),
    [bootstrapMutation],
  );

  return {
    loginMutation,
    logoutMutation,
    bootstrapMutation,
    login,
    logout,
    refreshServerToken,
  };
}
