"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { requiredPermissionFor, requiredRoleFor } from "@/lib/auth/routeAccess";

//Principal route guard hook
export default function RouteGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { hasPermission, hasRole } = useAuth();

    const required = requiredPermissionFor(pathname);
    const requiredRole = requiredRoleFor(pathname);
    const allowed =
        (required === null || hasPermission(required)) &&
        (requiredRole === null || hasRole(requiredRole));

    useEffect(() => {
        if (!allowed) router.replace("/dashboard");
    }, [allowed, router]);

    return allowed ? <>{children}</> : null;
}