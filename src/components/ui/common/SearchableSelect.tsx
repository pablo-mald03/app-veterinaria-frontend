"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { FIELD_STYLES, type FieldVariant } from "@/components/ui/types/fieldVariants";
import { useClickOutside } from "@/hooks/useClickOutside";
import FieldMessage from "./FieldMessage";

export interface SearchableOption {
    value: string;
    label: string;
    hint?: string;
}

interface SearchableSelectProps {
    label: string;
    options: SearchableOption[];
    value: string;
    onValueChange: (value: string) => void;
    search: string;
    onSearchChange: (search: string) => void;
    onSelect: (option: SearchableOption) => void;
    placeholder?: string;
    error?: string;
    message?: string;
    messageVariant?: Exclude<FieldVariant, "error">;
    emptyMessage?: string;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
}

//Dropdown with internal searching methods
export default function SearchableSelect({
    label,
    options,
    value,
    onValueChange,
    search,
    onSearchChange,
    onSelect,
    placeholder = "Buscar...",
    error,
    message,
    messageVariant = "info",
    emptyMessage = "No se encontraron resultados.",
    disabled = false,
    loading = false,
    icon,
}: SearchableSelectProps) {
    const autoId = useId();
    const inputId = autoId;
    const messageId = `${inputId}-message`;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const feedback = error
        ? { variant: "error" as const, text: error }
        : message
            ? { variant: messageVariant, text: message }
            : null;
    const styles = FIELD_STYLES[feedback?.variant ?? "neutral"];

    const selected = useMemo(
        () => options.find((o) => o.value === value),
        [options, value]
    );

    useClickOutside(wrapperRef, () => setOpen(false), open);

    const inputClasses = [
        "w-full rounded-xl border bg-white py-2.5 text-sm text-text outline-none transition-all placeholder:text-placeholder focus:ring-2 disabled:cursor-not-allowed disabled:bg-mint/40 disabled:text-text/50",
        styles.field,
        icon ? "pl-10" : "pl-4",
        "pr-16",
    ].filter(Boolean).join(" ");

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-text">
                {label}
            </label>

            <div ref={wrapperRef} className="relative flex items-center">
                {icon && (
                    <span className="pointer-events-none absolute left-3 z-10 text-accent [&>svg]:h-5 [&>svg]:w-5">
                        {icon}
                    </span>
                )}

                <input
                    id={inputId}
                    type="text"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={`${inputId}-list`}
                    aria-autocomplete="list"
                    aria-invalid={feedback?.variant === "error"}
                    aria-describedby={feedback ? messageId : undefined}
                    autoComplete="off"
                    disabled={disabled}
                    value={search}
                    placeholder={placeholder}
                    onFocus={() => setOpen(true)}
                    onChange={(e) => {
                        onSearchChange(e.target.value);
                        setOpen(true);
                        // Si el usuario cambia el texto y había uno seleccionado, se invalida
                        if (value) onValueChange("");
                    }}
                    className={inputClasses}
                />

                {value && !disabled ? (
                    <button
                        type="button"
                        onClick={() => {
                            onValueChange("");
                            onSearchChange("");
                        }}
                        aria-label="Limpiar selección"
                        className="absolute right-9 cursor-pointer rounded-full p-0.5 text-accent transition-colors hover:bg-mint hover:text-text"
                    >
                        <X className="h-4 w-4" />
                    </button>
                ) : null}

                <Search className="pointer-events-none absolute right-3 h-5 w-5 text-accent" />

                {open && (
                    <ul
                        id={`${inputId}-list`}
                        role="listbox"
                        className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-secondary bg-white p-1 shadow-lg motion-safe:animate-field-message"
                    >
                        {loading && (
                            <li role="presentation" className="px-3 py-2 text-sm text-text-muted">
                                Cargando...
                            </li>
                        )}

                        {!loading && options.length === 0 && (
                            <li role="presentation" className="px-3 py-2 text-sm text-text-muted">
                                {emptyMessage}
                            </li>
                        )}

                        {!loading &&
                            options.map((option) => {
                                const isSelected = option.value === value;
                                return (
                                    <li
                                        key={option.value}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => {
                                            onSelect(option);
                                            setOpen(false);
                                        }}
                                        className={[
                                            "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-text transition-colors hover:bg-mint",
                                            isSelected ? "bg-mint font-semibold" : "",
                                        ].filter(Boolean).join(" ")}
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate">{option.label}</p>
                                            {option.hint && (
                                                <p className="truncate text-xs text-text-muted">{option.hint}</p>
                                            )}
                                        </div>
                                        {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                                    </li>
                                );
                            })}
                    </ul>
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