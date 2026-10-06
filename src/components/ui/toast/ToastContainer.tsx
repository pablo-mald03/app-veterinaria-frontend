"use client";

import { Info, CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { useToast, useToastState } from "@/components/ui/toast/ToastProvider";
import { ToastVariant } from "@/types/toast/toast";
import { useState } from "react";
import { TOAST_CLOSE, TOAST_SURFACE } from "./types/toastVariants";

//Props for the toast
const ICONS: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
    default: Info,
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: XCircle,
};

//Toast container component
export default function ToastContainer() {
    const { toasts } = useToastState();
    const { remove } = useToast();
    const [hovered, setHovered] = useState(false);

    if (toasts.length === 0) return null;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="pointer-events-none fixed left-1/2 top-6 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col items-center"
        >
            {toasts.map((toast, i) => {
                const Icon = ICONS[toast.variant];
                const offsetY = hovered ? i * 90 : i * 12;
                const scale = hovered ? 1 : Math.max(0, 1 - i * 0.05);
                const opacity = !hovered && i > 0 ? Math.max(0, 1 - i * 0.2) : 1;

                return (
                    <div
                        key={toast.id}
                        role="status"
                        aria-live="polite"
                        style={{
                            transform: `translateY(${offsetY}px) scale(${scale})`,
                            zIndex: 50 - i,
                            opacity,
                        }}
                        className={[
                            "pointer-events-auto absolute w-full",
                            "flex gap-3 overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-md ring-1 ring-black/5",
                            "transition-all duration-300 ease-out motion-safe:animate-toast-in",
                            TOAST_SURFACE[toast.variant],
                        ].join(" ")}
                    >
                        <Icon className="mt-0.5 h-5 w-5 shrink-0" />

                        <div className="min-w-0 flex-1">
                            {toast.title && (
                                <p className="truncate text-sm font-bold">{toast.title}</p>
                            )}
                            <p className="text-sm opacity-90">{toast.message}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => remove(toast.id)}
                            aria-label="Cerrar notificación"
                            className={[
                                "shrink-0 cursor-pointer rounded-md p-1.5 transition-colors",
                                TOAST_CLOSE[toast.variant],
                            ].join(" ")}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}