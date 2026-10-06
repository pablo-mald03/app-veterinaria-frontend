export type FieldVariant = "error" | "warning" | "info" | "success";
export type FieldTone = FieldVariant | "neutral";

interface ToneStyles {
    text: string;
    field: string;
}

//Principal field styles
export const FIELD_STYLES: Record<FieldTone, ToneStyles> = {
    neutral: { text: "text-text-muted", field: "border-secondary focus:border-primary focus:ring-primary/20" },
    error: { text: "text-danger-strong", field: "border-danger focus:border-danger focus:ring-danger/20" },
    warning: { text: "text-warning", field: "border-warning focus:border-warning focus:ring-warning/20" },
    info: { text: "text-accent", field: "border-accent focus:border-accent focus:ring-accent/20" },
    success: { text: "text-success", field: "border-success focus:border-success focus:ring-success/20" },
};