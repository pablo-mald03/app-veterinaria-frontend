"use client";

import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import SidebarNav from "./SidebarNav";
import SidebarLogoutButton from "./SidebarLogoutButton";

//Principal sidebar component
export default function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside className={`sticky top-24 hidden h-[calc(100dvh-6rem)] shrink-0 self-start flex-col justify-between overflow-hidden border-r-2 border-secondary/40 bg-white shadow-lg transition-[width] duration-300 md:flex ${collapsed ? "w-20" : "w-72"}`}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className={`flex px-3 pt-3 ${collapsed ? "justify-center" : "justify-end"}`}>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            title={collapsed ? "Expandir menú" : "Contraer menú"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-accent transition-colors hover:bg-mint"
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>
        </div>
        <SidebarNav collapsed={collapsed} />
      </div>
      <SidebarLogoutButton collapsed={collapsed} />
    </aside>
  );
}