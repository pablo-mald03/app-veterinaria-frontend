"use client";

import { useId, useRef, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import FieldMessage from "@/components/ui/common/FieldMessage";
import { FIELD_STYLES, type FieldVariant } from "../types/fieldVariants";

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "value" | "onChange" | "size"> {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    icon?: React.ReactNode;
    trailing?: React.ReactNode;
    /** Error message */
    error?: string;
    /** Informative message */
    message?: string;
    messageVariant?: Exclude<FieldVariant, "error">;
    clearable?: boolean;
    hoverable?: boolean;
}

const RIGHT_PADDING = ["pr-4", "pr-10", "pr-[4.5rem]", "pr-24"];

//Reactive textfield component
export default function TextField({
    label,
    value,
    onValueChange,
    icon,
    trailing,
    error,
    message,
    messageVariant = "info",
    clearable = false,
    hoverable = true,
    id,
    type = "text",
    disabled,
    readOnly,
    ...inputProps
}: TextFieldProps) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const messageId = `${inputId}-message`;
    const inputRef = useRef<HTMLInputElement>(null);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const isPassword = type === "password";
    const showClear = clearable && value.length > 0 && !disabled && !readOnly;
    const trailingCount = [showClear, isPassword, Boolean(trailing)].filter(Boolean).length;

    const feedback = error
        ? { variant: "error" as const, text: error }
        : message
            ? { variant: messageVariant, text: message }
            : null;

    const styles = FIELD_STYLES[feedback?.variant ?? "neutral"];

    const classes = [
        "w-full rounded-xl border bg-white py-2.5 text-sm text-text outline-none transition-all placeholder:text-placeholder focus:ring-2 disabled:cursor-not-allowed disabled:bg-mint/40 disabled:text-text/50",
        styles.field,
        hoverable && !feedback ? "enabled:hover:border-primary enabled:hover:shadow-sm" : "",
        icon ? "pl-10" : "pl-4",
        RIGHT_PADDING[trailingCount],
    ].filter(Boolean).join(" ");

    const handleClear = () => {
        onValueChange("");
        inputRef.current?.focus();
    };

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-text">{label}</label>

            <div className="relative flex items-center">
                {icon && <span className="pointer-events-none absolute left-3 text-accent [&>svg]:h-5 [&>svg]:w-5">{icon}</span>}

                <input
                    {...inputProps}
                    ref={inputRef}
                    id={inputId}
                    type={isPassword && passwordVisible ? "text" : type}
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    disabled={disabled}
                    readOnly={readOnly}
                    aria-invalid={feedback?.variant === "error"}
                    aria-describedby={feedback ? messageId : undefined}
                    className={classes}
                />

                {trailingCount > 0 && (
                    <div className="absolute right-3 flex items-center gap-1">
                        {showClear && (
                            <button type="button" onClick={handleClear} aria-label="Limpiar campo" className="cursor-pointer rounded-full p-0.5 text-accent transition-colors hover:bg-mint hover:text-text">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                        {isPassword && (
                            <button type="button" onClick={() => setPasswordVisible((current) => !current)} aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"} className="cursor-pointer rounded-full p-0.5 text-accent transition-colors hover:text-text">
                                {passwordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        )}
                        {trailing}
                    </div>
                )}
            </div>

            {feedback && <FieldMessage variant={feedback.variant} id={messageId}>{feedback.text}</FieldMessage>}
        </div>
    );
}