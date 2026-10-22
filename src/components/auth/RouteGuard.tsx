"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { allowedRolesFor, requiredPermissionFor, requiredRoleFor } from "@/lib/auth/routeAccess";

//Principal route guard hook
export default function RouteGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { hasPermission, hasRole } = useAuth();

    const required = requiredPermissionFor(pathname);
    const requiredRole = requiredRoleFor(pathname);
    const allowedRoles = allowedRolesFor(pathname);
    const allowed =
        (required === null || hasPermission(required)) &&
        (requiredRole === null || hasRole(requiredRole));
    const roleAllowed = allowedRoles === null || allowedRoles.some((role) => hasRole(role));
    const accessAllowed = allowed && roleAllowed;

    useEffect(() => {
        if (!accessAllowed) router.replace("/dashboard");
    }, [accessAllowed, router]);

    return accessAllowed ? <>{children}</> : null;
}