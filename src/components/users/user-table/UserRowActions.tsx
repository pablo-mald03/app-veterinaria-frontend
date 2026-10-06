"use client";

import { Ban, Edit3, ShieldCheck } from "lucide-react";

interface UserRowActionsProps {
    active: boolean;
    canEdit: boolean;
    canDeactivate: boolean;
    onEdit: () => void;
    onDeactivate: () => void;
    onReactivate: () => void;
}

//User actions for rows component with RBAC modules
export default function UserRowActions({
    active,
    canEdit,
    canDeactivate,
    onEdit,
    onDeactivate,
    onReactivate,
}: UserRowActionsProps) {
    if (!canEdit && !canDeactivate) return null;

    return (
        <div className="flex justify-center gap-2">
            {canEdit && (
                <button
                    type="button"
                    onClick={onEdit}
                    className="cursor-pointer rounded-lg p-2 text-accent transition-colors hover:bg-mint"
                    title="Editar usuario"
                    aria-label="Editar usuario"
                >
                    <Edit3 className="h-4 w-4" />
                </button>
            )}

            {canDeactivate && active && (
                <button
                    type="button"
                    onClick={onDeactivate}
                    className="cursor-pointer rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                    title="Desactivar usuario"
                    aria-label="Desactivar usuario"
                >
                    <Ban className="h-4 w-4" />
                </button>
            )}

            {canDeactivate && !active && (
                <button
                    type="button"
                    onClick={onReactivate}
                    className="cursor-pointer rounded-lg p-2 text-green-500 transition-colors hover:bg-green-50"
                    title="Reactivar usuario"
                    aria-label="Reactivar usuario"
                >
                    <ShieldCheck className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}