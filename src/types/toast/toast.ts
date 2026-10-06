export type ToastVariant = "default" | "info" | "success" | "warning" | "error";

//Toast model for UI
export interface Toast {
    id: string;
    message: string;
    title?: string;
    variant: ToastVariant;
}

export type ToastInput = Omit<Toast, "id">;