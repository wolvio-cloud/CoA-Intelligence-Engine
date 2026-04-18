"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, loginWithPassword, registerAccount, type MeResponse } from "@/lib/authApi";
import { getStoredToken, setStoredToken } from "@/lib/authToken";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

function meToUser(me: MeResponse): AuthUser {
  const display =
    (me.full_name && me.full_name.trim()) ||
    me.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { id: me.id, email: me.email, displayName: display, role: me.role || "analyst" };
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => {},
  register: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await fetchMe();
      setUser(meToUser(me));
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const onExpired = () => {
      setUser(null);
    };
    window.addEventListener("coa:session-expired", onExpired);
    return () => window.removeEventListener("coa:session-expired", onExpired);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await loginWithPassword(email, password);
    const me = await fetchMe();
    setUser(meToUser(me));
  }, []);

  const register = useCallback(async (email: string, password: string, fullName?: string, role?: string) => {
    await registerAccount(email, password, fullName, role);
    const me = await fetchMe();
    setUser(meToUser(me));
  }, []);

  const signOut = useCallback(async () => {
    setStoredToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, register, signOut }),
    [user, loading, signIn, register, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
