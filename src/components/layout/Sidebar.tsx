'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

import { 
  LayoutDashboard, 
  PawPrint, 
  CalendarDays, 
  Pill, 
  Folder, 
  CreditCard, 
  Users, 
  Contact,
  LogOut 
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pacientes", href: "/dashboard/pets", icon: PawPrint },
  { name: "Clientes", href: "/dashboard/clients", icon: Contact },
  { name: "Agenda de Citas", href: "/agenda", icon: CalendarDays },
  { name: "Farmacia e Inventario", href: "/farmacia", icon: Pill },
  { name: "Gestión de Documentos", href: "/documentos", icon: Folder },
  { name: "Facturación", href: "/facturacion", icon: CreditCard },
  { name: "Recursos Humanos", href: "/dashboard/users", icon: Users },
];


export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="flex w-72 flex-col justify-between border-r-2 border-[#A7E0DB]/40 bg-white shadow-lg">
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-4 px-4 text-xs font-bold uppercase tracking-wider text-[#3E6D9C]">
          Menú Principal
        </p>
        <ul className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname?.startsWith(`${item.href}/`);

            const IconComponent = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 ${
                    isActive
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