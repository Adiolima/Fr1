"use client";

import React, { createContext, useContext, useEffect, useCallback } from "react";
import { useAuthStore, type User } from "@/lib/auth-store";
import api from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const store = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function initSession() {
      try {
        console.log("[AuthProvider] A iniciar sessão — a chamar /api/v1/auth/refresh...");
        const res = await fetch("/api/v1/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          signal: AbortSignal.timeout(8000),
        });

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          const token: string = data?.dados?.access_token ?? data?.access_token ?? "";
          const usuario = data?.dados?.usuario ?? data?.usuario;

          console.log("[AuthProvider] Refresh OK, token:", token ? `${token.slice(0, 20)}...` : "NULO");

          if (token && usuario) {
            store.setAuth(token, usuario);
          } else if (token) {
            store.setToken(token);
          } else {
            store.setLoading(false);
          }
        } else {
          console.log("[AuthProvider] Refresh falhou — status:", res.status);
          store.setLoading(false);
        }
      } catch {
        if (!cancelled) store.setLoading(false);
      }
    }

    initSession();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(
    (token: string, user: User) => store.setAuth(token, user),
    [store],
  );

  const setUser = useCallback(
    (user: User) => store.setUser(user),
    [store],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Silencioso
    } finally {
      store.clearAuth();
    }
  }, [store]);

  const value: AuthContextValue = {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login,
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
