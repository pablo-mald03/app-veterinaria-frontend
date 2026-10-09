"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import SidebarNav from "./SidebarNav";
import SidebarLogoutButton from "./SidebarLogoutButton";

//Principal sidebar mobile component
export default function SidebarMobile() {
    const { mobileOpen, closeMobile } = useSidebar();
    const pathname = usePathname();

    useEffect(() => {
        closeMobile();
    }, [pathname, closeMobile]);

    useEffect(() => {
        if (!mobileOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeMobile();
        };
        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [mobileOpen, closeMobile]);

    return (
        <div className={`fixed inset-0 z-[60] md:hidden ${mobileOpen ? "" : "pointer-events-none"}`} aria-hidden={!mobileOpen}>
            <div onClick={closeMobile} className={`absolute inset-0 bg-text/50 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`} />

            <aside role="dialog" aria-modal="true" aria-label="Menú principal" className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex h-16 shrink-0 items-center justify-between border-b-2 border-primary bg-mint px-4">
                    <span className="text-xl font-bold tracking-wide text-text" style={{ fontFamily: "'Young Serif', serif" }}>
                        Happy Pets
                    </span>
                    <button
                        type="button"
                        onClick={closeMobile}
                        aria-label="Cerrar menú"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-text transition-colors hover:bg-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <SidebarNav onNavigate={closeMobile} />
                <SidebarLogoutButton />
            </aside>
        </div>
    );
}