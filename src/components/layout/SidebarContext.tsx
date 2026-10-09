"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "happypets:sidebar-collapsed";
const DESKTOP_QUERY = "(min-width: 768px)";

interface SidebarContextValue {
    collapsed: boolean;
    mobileOpen: boolean;
    toggleCollapsed: () => void;
    openMobile: () => void;
    closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

//Principal sidebar provider
export function SidebarProvider({ children }: { children: ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        try {
            setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
        } catch { }
    }, []);

    useEffect(() => {
        const mq = window.matchMedia(DESKTOP_QUERY);
        const onChange = (e: MediaQueryListEvent) => {
            if (e.matches) setMobileOpen(false);
        };
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    const toggleCollapsed = useCallback(() => {
        setCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
            } catch { }
            return next;
        });
    }, []);

    const openMobile = useCallback(() => setMobileOpen(true), []);
    const closeMobile = useCallback(() => setMobileOpen(false), []);

    const value = useMemo(
        () => ({ collapsed, mobileOpen, toggleCollapsed, openMobile, closeMobile }),
        [collapsed, mobileOpen, toggleCollapsed, openMobile, closeMobile]
    );

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
    const ctx = useContext(SidebarContext);
    if (!ctx) throw new Error("useSidebar debe usarse dentro de <SidebarProvider>");
    return ctx;
}