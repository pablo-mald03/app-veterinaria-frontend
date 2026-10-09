"use client";

interface StatusBadgeProps {
    active: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
}

export default function StatusBadge({ active, activeLabel = "Activo", inactiveLabel = "Inactivo" }: StatusBadgeProps) {
    const classes = active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";

    return (
        <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${classes}`}>
            {active ? activeLabel : inactiveLabel}
        </span>
    );
}
