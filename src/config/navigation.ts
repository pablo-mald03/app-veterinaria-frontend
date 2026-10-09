import type { LucideIcon } from "lucide-react";
import {
    CalendarDays,
    Contact,
    CreditCard,
    BedDouble,
    Syringe,
    Folder,
    LayoutDashboard,
    PawPrint,
    Pill,
    ScrollText,
    ShieldCheck,
    Users,
} from "lucide-react";

export interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
    permission: string | null;
}

export const NAV_ITEMS: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: null },
    { name: "Pacientes", href: "/dashboard/pets", icon: PawPrint, permission: "mascotas:ver" },
    { name: "Clientes", href: "/dashboard/clients", icon: Contact, permission: "clientes:ver" },
    { name: "Habitaciones", href: "/dashboard/rooms", icon: BedDouble, permission: "salas:ver" },
    { name: "Agenda de Citas", href: "/agenda", icon: CalendarDays, permission: "citas:ver" },
    { name: "Farmacia e Inventario", href: "/farmacia", icon: Pill, permission: "inventario:ver" },
    // TEMPORAL: el catálogo de vacunas debería vivir dentro de Inventario; se deja aquí
    // mientras ese módulo no exista, para poder insertar vacunas sin migraciones manuales.
    { name: "Catálogo de Vacunas", href: "/dashboard/vaccines", icon: Syringe, permission: "vacunacion:ver" },
    { name: "Gestión de Documentos", href: "/documentos", icon: Folder, permission: "documentos:ver" },
    { name: "Recursos Humanos", href: "/dashboard/users", icon: Users, permission: "usuarios:ver" },
    { name: "Roles y Permisos", href: "/dashboard/roles", icon: ShieldCheck, permission: "roles:ver" },
    { name: "Bitácora de Logs", href: "/dashboard/logs", icon: ScrollText, permission: "logs:ver" },
];