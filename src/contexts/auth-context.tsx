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
import { useAuthSessionMutations } from "@/hooks/auth/use-auth-session-mutations";
import { getStoredToken } from "@/lib/auth/token-store";
import type { LoginPayload, LoginResult } from "@/services/auth.service";

type AuthContextValue = {
  token: string | null;
  isBootstrapping: boolean;
  bootstrapError: Error | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshServerToken: () => Promise<string>;
  /** Same credentials flow as `login()`; exposes React Query mutation state. */
  loginMutation: UseMutationResult<LoginResult, Error, LoginPayload>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<Error | null>(null);

  const {
    loginMutation,
    login: loginInner,
    logout,
    refreshServerToken,
  } = useAuthSessionMutations(setToken);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setBootstrapError(null);
      await loginInner(payload);
    },
    [loginInner],
  );

  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (getStoredToken()) {
        setIsBootstrapping(false);
        return;
      }
      setBootstrapError(null);
      try {
        await refreshServerToken();
      } catch (e) {
        if (!cancelled) {
          setBootstrapError(
            e instanceof Error ? e : new Error("Token bootstrap failed"),
          );
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshServerToken]);

  const value = useMemo(
    () => ({
      token,
      isBootstrapping,
      bootstrapError,
      login,
      logout,
      refreshServerToken,
      loginMutation,
    }),
    [
      token,
      isBootstrapping,
      bootstrapError,
      login,
      logout,
      refreshServerToken,
      loginMutation,
    ],
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
