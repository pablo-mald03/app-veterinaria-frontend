import { ToastVariant } from "@/types/toast/toast";

//Toast icon
export const TOAST_ICONS: Record<ToastVariant, string> = {
    default: "info",
    info: "info",
    success: "check-circle",
    warning: "alert-triangle",
    error: "x-circle",
};

// Toast surface colors
export const TOAST_SURFACE: Record<ToastVariant, string> = {
    default:
        "bg-white/80           border-l-4 border-text           text-text",
    info:
        "bg-blue-100/75        border-l-4 border-accent         text-accent",
    success:
        "bg-emerald-100/75     border-l-4 border-emerald-600    text-emerald-900",
    warning:
        "bg-amber-100/75       border-l-4 border-amber-600      text-amber-900",
    error:
        "bg-red-100/75         border-l-4 border-red-600        text-red-900",
};

// Button color
export const TOAST_CLOSE: Record<ToastVariant, string> = {
    default: "text-text-muted  hover:bg-mint/60        hover:text-text",
    info: "text-accent       hover:bg-blue-200/70     hover:text-accent",
    success: "text-emerald-700  hover:bg-emerald-200/70  hover:text-emerald-900",
    warning: "text-amber-700    hover:bg-amber-200/70    hover:text-amber-900",
    error: "text-red-700      hover:bg-red-200/70      hover:text-red-900",
};