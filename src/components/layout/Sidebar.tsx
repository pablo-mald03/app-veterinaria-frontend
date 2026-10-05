'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { NAV_ITEMS } from "@/config/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const { hasPermission, logout } = useAuth();

  return (
    <aside className="flex w-72 flex-col justify-between border-r-2 border-[#A7E0DB]/40 bg-white shadow-lg">
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-4 px-4 text-xs font-bold uppercase tracking-wider text-[#3E6D9C]">
          Menú Principal
        </p>
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
                    className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 ${isActive
                        ? "bg-[#5FB0C9] text-white shadow-md font-semibold"
                        : "text-[#2A2F63] hover:bg-[#E3F6F5] hover:text-[#3E6D9C] font-medium"
                      }`}
                  >
                    <IconComponent className={`h-5 w-5 ${isActive ? "text-white" : "text-[#2A2F63] opacity-80"}`} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      <div className="border-t border-[#A7E0DB]/40 p-4">
        <button onClick={() => void logout()} className="flex w-full items-center gap-4 rounded-xl px-4 py-3 font-medium text-red-500 transition-colors hover:bg-red-50">
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}