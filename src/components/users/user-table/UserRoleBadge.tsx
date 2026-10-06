"use client";

import { ShieldCheck } from "lucide-react";

interface UserRoleBadgeProps {
    roleName?: string;
}

//User role badge component
export default function UserRoleBadge({ roleName }: UserRoleBadgeProps) {
    return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/30 px-2.5 py-1 text-xs font-bold text-accent">
            <ShieldCheck className="h-3.5 w-3.5" />
            {roleName ?? "Rol indefinido"}
        </span>
    );
}