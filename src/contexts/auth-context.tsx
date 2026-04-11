"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuthSessionMutations } from "@/hooks/auth/useAuthSessionMutations";
import { getStoredToken } from "@/lib/auth/tokenStore";
import type { LoginPayload, LoginResult } from "@/services/auth.service";

type AuthContextValue = {
  token: string | null;
  login: (payload: LoginPayload) => Promise<LoginResult>;
  logout: () => Promise<void>;
  /** Same credentials flow as `login()`; exposes React Query mutation state. */
  loginMutation: UseMutationResult<LoginResult, Error, LoginPayload>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  const { loginMutation, login: loginInner, logout } =
    useAuthSessionMutations(setToken);

  const login = useCallback(
    async (payload: LoginPayload) => {
      return loginInner(payload);
    },
    [loginInner],
  );

  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  const value = useMemo(
    () => ({
      token,
      login,
      logout,
      loginMutation,
    }),
    [token, login, logout, loginMutation],
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

export function useOptionalToken(): string | null {
  const ctx = useContext(AuthContext);
  return ctx?.token ?? null;
}
