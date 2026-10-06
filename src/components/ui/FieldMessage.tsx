import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { FIELD_STYLES, type FieldVariant } from "./types/fieldVariants";

const ICONS = { error: AlertCircle, warning: AlertTriangle, info: Info, success: CheckCircle2 } as const;

interface FieldMessageProps {
    variant: FieldVariant;
    id?: string;
    children: React.ReactNode;
}

//Message under a field component
export default function FieldMessage({ variant, id, children }: FieldMessageProps) {
    const Icon = ICONS[variant];

    return (
        <p id={id} role={variant === "error" ? "alert" : undefined} className={`flex items-center gap-1.5 text-xs font-medium motion-safe:animate-field-message ${FIELD_STYLES[variant].text}`}>
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{children}</span>
        </p>
    );
}