"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { NAV_ITEMS } from "@/config/navigation";

interface SidebarNavProps {
    collapsed?: boolean;
    onNavigate?: () => void;
}

//Principal sidebar nav component
export default function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
    const pathname = usePathname();
    const { hasPermission } = useAuth();

    return (
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
            {!collapsed && (
                <p className="mb-4 px-4 text-xs font-bold uppercase tracking-wider text-accent">Menú Principal</p>
            )}
            <ul className="flex flex-col gap-2">
                {NAV_ITEMS
                    .filter((item) => item.permission === null || hasPermission(item.permission))
                    .map((item) => {
                        const isActive =
                            item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname === item.href || pathname?.startsWith(`${item.href}/`);

                        const IconComponent = item.icon;

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    onClick={onNavigate}
                                    title={collapsed ? item.name : undefined}
                                    aria-label={item.name}
                                    className={`flex items-center rounded-xl py-3 transition-all duration-200 ${collapsed ? "justify-center px-0" : "gap-4 px-4"} ${isActive ? "bg-primary text-white shadow-md font-semibold" : "text-text hover:bg-mint hover:text-accent font-medium"}`}
                                >
                                    <IconComponent className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-text opacity-80"}`} />
                                    {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
                                </Link>
                            </li>
                        );
                    })}
            </ul>
        </nav>
    );
}