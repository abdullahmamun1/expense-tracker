"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "./api";

type User = { id: string; email: string };
type Status = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: User | null;
  status: Status;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const refresh = useCallback(async () => {
    const res = await authApi.me();
    if (res.ok) {
      setUser(await res.json());
      setStatus("authenticated");
    } else {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    // Syncing with the external session cookie on mount, not deriving state
    // from props/state — the set-state-in-effect rule can't tell setState
    // here happens after an await, so it flags this valid fetch-on-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
