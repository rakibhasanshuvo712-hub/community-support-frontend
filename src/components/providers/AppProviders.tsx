"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { apiFetch, getStoredToken, setStoredToken } from "@/lib/api";
import { translations, type Language } from "@/lib/i18n";
import type { UserProfile } from "@/types";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (typeof translations)[Language];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  setTokenAndRefresh: (token: string | null) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
          },
        },
      })
  );

  const [lang, setLangState] = useState<Language>("en");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("sahayata_lang") : null;
    if (saved === "bn" || saved === "en") {
      queueMicrotask(() => setLangState(saved));
    }
  }, []);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("sahayata_lang", next);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await apiFetch<{ user: UserProfile }>("/auth/me", { token });
      setUser(data.user);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshUser();
    });
  }, [refreshUser]);

  const setTokenAndRefresh = useCallback(
    async (token: string | null) => {
      setStoredToken(token);
      setIsLoading(true);
      await refreshUser();
    },
    [refreshUser]
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors during logout
    } finally {
      setStoredToken(null);
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
        <AuthContext.Provider value={{ user, isLoading, setTokenAndRefresh, refreshUser, logout }}>
          {children}
        </AuthContext.Provider>
      </LanguageContext.Provider>
    </QueryClientProvider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within AppProviders");
  return ctx;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AppProviders");
  return ctx;
}
