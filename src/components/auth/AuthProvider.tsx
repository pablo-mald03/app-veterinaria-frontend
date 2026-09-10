'use client';

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/service/auth.service";
import { AuthUserDto } from "@/types/auth";

interface AuthContextValue {
  user: AuthUserDto | null;
  loading: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    authService.getCurrentUser()
      .then((currentUser) => {
        if (mounted) setUser(currentUser);
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
          router.replace("/login");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    hasRole: (role) => Boolean(user?.roles.some((item) => item.toUpperCase() === role.toUpperCase())),
    hasPermission: (permission) => Boolean(user?.permissions.includes(permission)),
    logout: async () => {
      await authService.logout();
      setUser(null);
      router.replace("/login");
    },
  }), [loading, router, user]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#2A2F63]">Verificando sesión...</div>;
  }

  if (!user) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}