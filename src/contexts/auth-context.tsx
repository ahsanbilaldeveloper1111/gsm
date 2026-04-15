"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useAuthSessionMutations } from "@/hooks/auth/useAuthSessionMutations";
import { apiPost } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type { LoginPayload, LoginResult } from "@/services/auth.service";

type AuthContextValue = {
  login: (payload: LoginPayload) => Promise<LoginResult>;
  logout: () => Promise<void>;
  /** Same credentials flow as `login()`; exposes React Query mutation state. */
  loginMutation: UseMutationResult<LoginResult, Error, LoginPayload>;
  /**
   * `POST /get-token` — refreshes the HTTP-only JWT via the Next proxy when the backend allows it.
   * Safe to call on load; failures are ignored (session is enforced by `/user` in guarded layouts).
   */
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loginMutation, login: loginInner, logout } = useAuthSessionMutations();

  const login = useCallback(
    async (payload: LoginPayload) => {
      return loginInner(payload);
    },
    [loginInner],
  );

  const refreshSession = useCallback(async () => {
    if (typeof window !== "undefined" && window.location.pathname === "/login") {
      return;
    }
    try {
      await apiPost<unknown>(apiRoutes.token.getTokenPost(), {});
    } catch {
      /* not authenticated or backend declined — guarded routes use `/user` */
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      login,
      logout,
      loginMutation,
      refreshSession,
    }),
    [login, logout, loginMutation, refreshSession],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
