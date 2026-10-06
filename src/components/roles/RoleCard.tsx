"use client";

import { useMemo } from "react";
import { KeyRound, Pencil, PowerOff, ShieldOff, ShieldCheck, Trash2 } from "lucide-react";
import Card from "@/components/ui/common/Card";
import RowActions from "@/components/ui/table/RowActions";
import { Role } from "@/services/roleService";
import { getRoleIcon } from "./types/roleIcons";

//Role card props
interface RoleCardProps {
    role: Role;
    canEdit: boolean;
    canDelete: boolean;
    canToggle: boolean;
    onEdit: (role: Role) => void;
    onDelete: (role: Role) => void;
    onManagePermissions: (role: Role) => void;
    onToggleStatus: (role: Role) => void;
}

//Role card component
export default function RoleCard({
    role,
    canEdit,
    canDelete,
    canToggle,
    onEdit,
    onDelete,
    onManagePermissions,
    onToggleStatus,
}: RoleCardProps) {
    const Icon = useMemo(() => getRoleIcon(role.alias), [role.alias]);
    const isActive = role.active ?? true;

    return (
        <Card hoverable className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
                <div
                    className={[
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                        isActive ? "bg-primary/10 text-primary" : "bg-mint text-text-muted",
                    ].join(" ")}
                >
                    <Icon className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-bold text-text">{role.name}</h3>
                        {!isActive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                                <PowerOff className="h-3 w-3" />
                                Inactivo
                            </span>
                        )}
                    </div>
                    <p className="truncate font-mono text-xs text-accent">{role.alias}</p>
                </div>
            </div>

            <p className="line-clamp-2 min-h-[2.5rem] text-sm text-text/70">
                {role.description?.trim() || "Sin descripción."}
            </p>

            {(canEdit || canDelete || canToggle) && (
                <div className="flex justify-end gap-2 border-t border-mint pt-3">
                    <RowActions
                        actions={[
                            {
                                icon: <KeyRound className="h-4 w-4" />,
                                label: `Gestionar permisos de ${role.name}`,
                                onClick: () => onManagePermissions(role),
                                variant: "default",
                                visible: canEdit,
                            },
                            {
                                icon: <Pencil className="h-4 w-4" />,
                                label: `Editar ${role.name}`,
                                onClick: () => onEdit(role),
                                variant: "default",
                                visible: canEdit,
                            },
                            {
                                icon: isActive
                                    ? <ShieldOff className="h-4 w-4" />
                                    : <ShieldCheck className="h-4 w-4" />,
                                label: isActive ? `Desactivar ${role.name}` : `Activar ${role.name}`,
                                onClick: () => onToggleStatus(role),
                                variant: isActive ? "danger" : "success",
                                visible: canToggle,
                            },
                            {
                                icon: <Trash2 className="h-4 w-4" />,
                                label: `Eliminar ${role.name}`,
                                onClick: () => onDelete(role),
                                variant: "danger",
                                visible: canDelete,
                            },
                        ]}
                    />
                </div>
            )}
        </Card>
    );
}