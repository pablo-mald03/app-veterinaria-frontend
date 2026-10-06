"use client";

import { useId, useRef } from "react";
import { X } from "lucide-react";
import { FIELD_STYLES, type FieldVariant } from "@/components/ui/types/fieldVariants";
import FieldMessage from "./FieldMessage";

interface TextAreaProps
    extends Omit<
        React.TextareaHTMLAttributes<HTMLTextAreaElement>,
        "className" | "value" | "onChange"
    > {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    icon?: React.ReactNode;
    error?: string;
    message?: string;
    messageVariant?: Exclude<FieldVariant, "error">;
    clearable?: boolean;
    hoverable?: boolean;
}

//Reactive textarea component
export default function TextArea({
    label,
    value,
    onValueChange,
    icon,
    error,
    message,
    messageVariant = "info",
    clearable = false,
    hoverable = true,
    id,
    disabled,
    readOnly,
    rows = 3,
    ...textareaProps
}: TextAreaProps) {
    const autoId = useId();
    const textareaId = id ?? autoId;
    const messageId = `${textareaId}-message`;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const showClear = clearable && value.length > 0 && !disabled && !readOnly;

    const feedback = error
        ? { variant: "error" as const, text: error }
        : message
            ? { variant: messageVariant, text: message }
            : null;

    const styles = FIELD_STYLES[feedback?.variant ?? "neutral"];

    const classes = [
        "w-full rounded-xl border bg-white py-2.5 text-sm text-text outline-none transition-all placeholder:text-placeholder focus:ring-2 disabled:cursor-not-allowed disabled:bg-mint/40 disabled:text-text/50 resize-none",
        styles.field,
        hoverable && !feedback ? "enabled:hover:border-primary enabled:hover:shadow-sm" : "",
        icon ? "pl-10" : "pl-4",
        showClear ? "pr-10" : "pr-4",
    ]
        .filter(Boolean)
        .join(" ");

    const handleClear = () => {
        onValueChange("");
        textareaRef.current?.focus();
    };

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={textareaId} className="text-xs font-bold uppercase tracking-wider text-text">
                {label}
            </label>

            <div className="relative flex">
                {icon && (
                    <span className="pointer-events-none absolute left-3 top-3 text-accent [&>svg]:h-5 [&>svg]:w-5">
                        {icon}
                    </span>
                )}

                <textarea
                    {...textareaProps}
                    ref={textareaRef}
                    id={textareaId}
                    rows={rows}
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    disabled={disabled}
                    readOnly={readOnly}
                    aria-invalid={feedback?.variant === "error"}
                    aria-describedby={feedback ? messageId : undefined}
                    className={classes}
                />

                {showClear && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Limpiar campo"
                        className="absolute right-3 top-3 cursor-pointer rounded-full p-0.5 text-accent transition-colors hover:bg-mint hover:text-text"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {feedback && (
                <FieldMessage variant={feedback.variant} id={messageId}>
                    {feedback.text}
                </FieldMessage>
            )}
        </div>
    );
}