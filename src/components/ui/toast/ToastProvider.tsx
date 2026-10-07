"use client";

import { Toast, ToastInput } from "@/types/toast/toast";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";

const MAX_TOASTS = 5;
const AUTO_DISMISS_MS = 5000;

let toastCounter = 0;

function generateId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    toastCounter += 1;
    return `toast-${Date.now()}-${toastCounter}`;
}

// --- Context for actions ---
interface ToastActions {
    show: (toast: ToastInput) => string;
    remove: (id: string) => void;
    success: (message: string, title?: string) => string;
    error: (message: string, title?: string) => string;
    info: (message: string, title?: string) => string;
    warning: (message: string, title?: string) => string;
}

const ToastActionsContext = createContext<ToastActions | null>(null);

//Toast state
interface ToastState {
    toasts: Toast[];
}

const ToastStateContext = createContext<ToastState | null>(null);

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
            const id = generateId();
            setToasts((current) => [{ ...input, id }, ...current].slice(0, MAX_TOASTS));

            const timeout = setTimeout(() => remove(id), AUTO_DISMISS_MS);
            timeoutsRef.current.set(id, timeout);

            return id;
        },
        [remove]
    );

    const actions = useMemo<ToastActions>(
        () => ({
            show,
            remove,
            success: (message, title) => show({ message, title, variant: "success" }),
            error: (message, title) => show({ message, title, variant: "error" }),
            info: (message, title) => show({ message, title, variant: "info" }),
            warning: (message, title) => show({ message, title, variant: "warning" }),
        }),
        [show, remove]
    );

    const state = useMemo<ToastState>(() => ({ toasts }), [toasts]);

    return (
        <ToastActionsContext.Provider value={actions}>
            <ToastStateContext.Provider value={state}>
                {children}
            </ToastStateContext.Provider>
        </ToastActionsContext.Provider>
    );
}

// Hook for components
export function useToast(): ToastActions {
    const ctx = useContext(ToastActionsContext);
    if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>.");
    return ctx;
}

// Hook for the toast container
export function useToastState(): ToastState {
    const ctx = useContext(ToastStateContext);
    if (!ctx) throw new Error("useToastState debe usarse dentro de <ToastProvider>.");
    return ctx;
}