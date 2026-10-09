"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface SidebarLogoutButtonProps {
    collapsed?: boolean;
}

//Principal sidebar logout button component
export default function SidebarLogoutButton({ collapsed = false }: SidebarLogoutButtonProps) {
    const { logout } = useAuth();

    return (
        <div className="border-t border-secondary/40 p-3">
            <button
                type="button"
                onClick={() => void logout()}
                title={collapsed ? "Cerrar Sesión" : undefined}
                aria-label="Cerrar Sesión"
                className={`flex w-full items-center rounded-xl py-3 font-medium text-red-500 transition-colors hover:bg-red-50 ${collapsed ? "justify-center px-0" : "gap-4 px-4"}`}
            >
                <LogOut className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">Cerrar Sesión</span>}
            </button>
        </div>
    );
}