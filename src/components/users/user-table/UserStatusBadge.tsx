"use client";

interface UserStatusBadgeProps {
    active: boolean;
}

//User status badge component
export default function UserStatusBadge({ active }: UserStatusBadgeProps) {
    const classes = active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";

    return (
        <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${classes}`}>
            {active ? "Activo" : "Inactivo"}
        </span>
    );
}