"use client";

import { UserPlus } from "lucide-react";

interface UserTableHeaderProps {
    canCreate: boolean;
    onCreate: () => void;
}

//User table header component
export default function UserTableHeader({ canCreate, onCreate }: UserTableHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-text" style={{ fontFamily: "'Young Serif', serif" }}>
                    Gestión de Usuarios
                </h1>
                <p className="mt-1 text-sm text-text/70">
                    Administración de accesos y credenciales del personal de Happy Pets.
                </p>
            </div>

            {canCreate && (
                <button
                    type="button"
                    onClick={onCreate}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-accent"
                >
                    <UserPlus className="h-5 w-5" />
                    <span>Registrar Usuario</span>
                </button>
            )}
        </div>
    );
}