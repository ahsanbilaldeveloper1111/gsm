"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getStoredToken } from "@/lib/auth/token-store";
import { bootstrapTokenFromServer } from "@/services/token.service";
import type { LoginPayload } from "@/services/auth.service";
import { loginRequest, logoutRequest } from "@/services/auth.service";

type AuthContextValue = {
  token: string | null;
  isBootstrapping: boolean;
  bootstrapError: Error | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshServerToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<Error | null>(null);

  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  const refreshServerToken = useCallback(async () => {
    setBootstrapError(null);
    const jwt = await bootstrapTokenFromServer();
    setToken(jwt);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (getStoredToken()) {
        setIsBootstrapping(false);
        return;
      }
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

  const login = useCallback(async (payload: LoginPayload) => {
    setBootstrapError(null);
    const res = await loginRequest(payload);
    const jwt = res.access_token ?? res.token;
    if (jwt) setToken(jwt);
    else setToken(getStoredToken());
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isBootstrapping,
      bootstrapError,
      login,
      logout,
      refreshServerToken,
    }),
    [
      token,
      isBootstrapping,
      bootstrapError,
      login,
      logout,
      refreshServerToken,
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
