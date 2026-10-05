"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { requiredPermissionFor } from "@/lib/auth/routeAccess";

//Principal route guard hook
export default function RouteGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { hasPermission } = useAuth();

    const required = requiredPermissionFor(pathname);
    const allowed = required === null || hasPermission(required);

    useEffect(() => {
        if (!allowed) router.replace("/dashboard/forbidden");
    }, [allowed, router]);

    return allowed ? <>{children}</> : null;
}