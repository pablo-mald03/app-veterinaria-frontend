"use client";

import { Toast, ToastInput } from "@/types/toast/toast";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const MAX_TOASTS = 5;
const AUTO_DISMISS_MS = 5000;

//Toast props directive
interface ToastContextValue {
    toasts: Toast[];
    show: (toast: ToastInput) => string;
    remove: (id: string) => void;
    success: (message: string, title?: string) => string;
    error: (message: string, title?: string) => string;
    info: (message: string, title?: string) => string;
    warning: (message: string, title?: string) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

//Toast provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const remove = useCallback((id: string) => {
        const timeout = timeoutsRef.current.get(id);
        if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(id);
        }
        setToasts((current) => current.filter((t) => t.id !== id));
    }, []);

    const show = useCallback(
        (input: ToastInput) => {
            const id = crypto.randomUUID();
            setToasts((current) => [{ ...input, id }, ...current].slice(0, MAX_TOASTS));

            const timeout = setTimeout(() => remove(id), AUTO_DISMISS_MS);
            timeoutsRef.current.set(id, timeout);

            return id;
        },
        [remove]
    );

    const value = useMemo<ToastContextValue>(
        () => ({
            toasts,
            show,
            remove,
            success: (message, title) => show({ message, title, variant: "success" }),
            error: (message, title) => show({ message, title, variant: "error" }),
            info: (message, title) => show({ message, title, variant: "info" }),
            warning: (message, title) => show({ message, title, variant: "warning" }),
        }),
        [toasts, show, remove]
    );

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>.");
    return ctx;
}