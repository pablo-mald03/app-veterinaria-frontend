"use client";

import type { ReactNode } from "react";

export type BadgeVariant =
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "gray"
    | "default";

interface StatusBadgeVariantProps {
    variant?: BadgeVariant;
    children: ReactNode;
    className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    gray: "bg-gray-100 text-gray-700",
    default: "bg-gray-100 text-gray-700",
};

export default function StatusBadgeVariant({
                                               variant = "default",
                                               children,
                                               className = "",
                                           }: StatusBadgeVariantProps) {
    const colorClasses = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${colorClasses} ${className}`}
        >
            {children}
        </span>
    );
}