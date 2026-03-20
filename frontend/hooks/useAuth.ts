"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { Role } from "@/services/auth";

interface UseAuthOptions {
  requireRole?: Role;
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}): Role | null {
  const { requireRole, redirectTo = "/standings" } = options;
  const router = useRouter();
  const { role, status } = useAuthContext();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (
      status === "authenticated" &&
      requireRole &&
      role !== requireRole
    ) {
      router.replace(redirectTo);
    }
  }, [status, role, requireRole, redirectTo, router]);

  if (status !== "authenticated") return null;
  if (requireRole && role !== requireRole) return null;
  return role;
}
