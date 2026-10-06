"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "2xl";

const SIZES: Record<ModalSize, string> = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", "2xl": "max-w-2xl" };

//Modal props
interface ModalProps {
    open: boolean;
    onClose: () => void;
    size?: ModalSize;
    title?: string;
    subtitle?: string;
    ariaLabel?: string;
    dismissible?: boolean;
    children: React.ReactNode;
}

//Modal frame overlay component
export default function Modal({ open, onClose, size = "md", title, subtitle, ariaLabel, dismissible = true, children }: ModalProps) {
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && dismissible && !e.defaultPrevented) onClose();
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open, dismissible, onClose]);

    if (!open) return null;

    return (
        <div
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && dismissible) onClose();
            }}
            className="fixed inset-0 z-50 flex overflow-y-auto bg-text/40 p-4 backdrop-blur-sm"
        >
            <div role="dialog" aria-modal="true" aria-label={ariaLabel ?? title} className={`m-auto w-full ${SIZES[size]} rounded-3xl border border-secondary bg-white p-6 shadow-2xl motion-safe:animate-modal-in`}>
                {title && (
                    <div className="mb-4 flex items-center justify-between border-b border-mint pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-text">{title}</h2>
                            {subtitle && <p className="text-xs text-accent">{subtitle}</p>}
                        </div>
                        <button type="button" onClick={onClose} disabled={!dismissible} aria-label="Cerrar" className="cursor-pointer rounded-full p-1 text-text/50 transition-colors hover:bg-mint disabled:opacity-50">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}