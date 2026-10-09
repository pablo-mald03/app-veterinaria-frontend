import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

interface AlertProps {
    variant: "error" | "success" | "warning";
    children: React.ReactNode;
}

const STYLES = {
    error: "border-danger-border bg-danger-soft text-danger-strong",
    success: "border-success-border bg-success-soft text-success",
    warning: "border-warning-border bg-warning-soft text-warning",
};

const ICONS = {
    error: AlertCircle,
    success: CheckCircle2,
    warning: AlertTriangle,
};

//Alert component 
export default function Alert({ variant, children }: AlertProps) {
    const Icon = ICONS[variant];

    return (
        <div role={variant === "error" ? "alert" : "status"} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-center text-xs font-medium ${STYLES[variant]}`}>
            <Icon className="h-4 w-4 shrink-0" />
            <span>{children}</span>
        </div>
    );
}
