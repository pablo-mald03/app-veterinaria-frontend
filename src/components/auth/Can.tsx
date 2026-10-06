"use client";

import { useAuth } from "@/components/auth/AuthProvider";

interface CanProps {
    permission?: string;
    any?: string[];
    all?: string[];
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

//Hook to evaluate the permissions for single component
export default function Can({ permission, any, all, fallback = null, children }: CanProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

    const allowed =
        (permission ? hasPermission(permission) : true) &&
        (any ? hasAnyPermission(any) : true) &&
        (all ? hasAllPermissions(all) : true);

    return allowed ? <>{children}</> : <>{fallback}</>;
}