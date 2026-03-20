"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import axiosInstance from "@/services/api";
import { Role } from "@/services/auth";

const PUBLIC_PATHS = ["/login", "/register"];

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  role: Role | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchRole(): Promise<Role> {
  const res = await axiosInstance.get("/api/auth/user");
  return res.data?.data?.user?.role as Role;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState<Role | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    PUBLIC_PATHS.includes(pathname) ? "unauthenticated" : "loading"
  );

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const userRole = await fetchRole();
      setRole(userRole);
      setStatus("authenticated");
    } catch {
      setRole(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) return;
    
    fetchRole()
      .then((userRole) => {
        setRole(userRole);
        setStatus("authenticated");
      })
      .catch(() => {
        setRole(null);
        setStatus("unauthenticated");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ role, status, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within <AuthProvider>");
  return ctx;
}
