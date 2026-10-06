"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import FieldMessage from "@/components/ui/FieldMessage";
import Spinner from "@/components/ui/Spinner";
import { useClickOutside } from "@/hooks/useClickOutside";
import { FIELD_STYLES, type FieldVariant } from "./types/fieldVariants";

export interface DropdownOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface DropdownProps {
    label: string;
    options: DropdownOption[];
    value: string;
    onValueChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    icon?: React.ReactNode;
    error?: string;
    message?: string;
    messageVariant?: Exclude<FieldVariant, "error">;
    clearable?: boolean;
    hoverable?: boolean;
    disabled?: boolean;
    loading?: boolean;
    emptyMessage?: string;
    autoSelectFirst?: boolean;
    id?: string;
}

//Custom dropdown component
export default function Dropdown({
    label,
    options,
    value,
    onValueChange,
    onBlur,
    placeholder = "Selecciona una opción",
    icon,
    error,
    message,
    messageVariant = "info",
    clearable = false,
    hoverable = true,
    disabled = false,
    loading = false,
    emptyMessage = "No hay opciones disponibles.",
    autoSelectFirst = false,
    id,
}: DropdownProps) {
    const autoId = useId();
    const triggerId = id ?? autoId;
    const listId = `${triggerId}-list`;
    const messageId = `${triggerId}-message`;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const selectedIndex = options.findIndex((option) => option.value === value);
    const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;
    const showClear = clearable && !autoSelectFirst && value !== "" && !disabled;
    const triggerText = selected?.label ?? (loading && value ? "Cargando..." : null);

    const feedback = error
        ? { variant: "error" as const, text: error }
        : message
            ? { variant: messageVariant, text: message }
            : null;

    const styles = FIELD_STYLES[feedback?.variant ?? "neutral"];

    const triggerClasses = [
        "flex w-full items-center rounded-xl border bg-white py-2.5 text-left text-sm outline-none transition-all focus:ring-2 disabled:cursor-not-allowed disabled:bg-mint/40 disabled:text-text/50",
        styles.field,
        hoverable && !feedback ? "enabled:hover:border-primary enabled:hover:shadow-sm" : "",
        icon ? "pl-10" : "pl-4",
        showClear ? "pr-16" : "pr-10",
    ].filter(Boolean).join(" ");

    useEffect(() => {
        if (!autoSelectFirst || value !== "") return;
        const first = options.find((option) => !option.disabled);
        if (first) onValueChange(first.value);
    }, [autoSelectFirst, value, options, onValueChange]);

    useEffect(() => {
        if (open && activeIndex >= 0) listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
    }, [open, activeIndex]);

    const leave = () => {
        setOpen(false);
        onBlur?.();
    };

    useClickOutside(wrapperRef, leave, open);

    const openPanel = () => {
        if (disabled) return;
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : options.findIndex((option) => !option.disabled));
        setOpen(true);
    };

    const choose = (option: DropdownOption) => {
        if (option.disabled) return;
        onValueChange(option.value);
        setOpen(false);
    };

    const move = (delta: 1 | -1) => {
        if (options.length === 0) return;
        let next = activeIndex === -1 ? (delta === 1 ? -1 : options.length) : activeIndex;

        for (let i = 0; i < options.length; i++) {
            next = (next + delta + options.length) % options.length;
            if (!options[next].disabled) {
                setActiveIndex(next);
                return;
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (open) move(1);
                else openPanel();
                break;
            case "ArrowUp":
                e.preventDefault();
                if (open) move(-1);
                else openPanel();
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                if (!open) openPanel();
                else if (activeIndex >= 0) choose(options[activeIndex]);
                else setOpen(false);
                break;
            case "Escape":
                if (open) {
                    e.preventDefault();
                    setOpen(false);
                }
                break;
        }
    };

    const handleClear = () => {
        onValueChange("");
        triggerRef.current?.focus();
    };

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={triggerId} className="text-xs font-bold uppercase tracking-wider text-text">{label}</label>

            <div
                ref={wrapperRef}
                onBlur={(e) => {
                    if (!wrapperRef.current?.contains(e.relatedTarget as Node | null)) leave();
                }}
                className="relative flex items-center"
            >
                {icon && <span className="pointer-events-none absolute left-3 z-10 text-accent [&>svg]:h-5 [&>svg]:w-5">{icon}</span>}

                <button
                    ref={triggerRef}
                    id={triggerId}
                    type="button"
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-controls={open ? listId : undefined}
                    aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
                    aria-invalid={feedback?.variant === "error"}
                    aria-describedby={feedback ? messageId : undefined}
                    disabled={disabled}
                    onClick={() => (open ? setOpen(false) : openPanel())}
                    onKeyDown={handleKeyDown}
                    onKeyUp={(e) => {
                        if (e.key === " ") e.preventDefault();
                    }}
                    className={triggerClasses}
                >
                    <span className={`truncate ${triggerText ? "text-text" : "text-placeholder"}`}>{triggerText ?? placeholder}</span>
                </button>

                {showClear && (
                    <button type="button" onClick={handleClear} aria-label="Limpiar selección" className="absolute right-9 cursor-pointer rounded-full p-0.5 text-accent transition-colors hover:bg-mint hover:text-text">
                        <X className="h-4 w-4" />
                    </button>
                )}

                <ChevronDown className={`pointer-events-none absolute right-3 h-5 w-5 text-accent transition-transform ${open ? "rotate-180" : ""}`} />

                {open && (
                    <ul
                        ref={listRef}
                        id={listId}
                        role="listbox"
                        onMouseDown={(e) => e.preventDefault()}
                        className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-xl border border-secondary bg-white p-1 shadow-lg motion-safe:animate-field-message"
                    >
                        {loading && (
                            <li role="presentation" className="flex justify-center py-3"><Spinner className="h-5 w-5" /></li>
                        )}

                        {!loading && options.length === 0 && (
                            <li role="presentation" className="px-3 py-2 text-sm text-text-muted">{emptyMessage}</li>
                        )}

                        {!loading && options.map((option, index) => {
                            const isSelected = option.value === value;
                            const classes = [
                                "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-text transition-colors",
                                index === activeIndex ? "bg-mint" : "",
                                isSelected ? "font-semibold" : "",
                                option.disabled ? "cursor-not-allowed opacity-50" : "",
                            ].filter(Boolean).join(" ");

                            return (
                                <li
                                    key={option.value}
                                    id={`${listId}-${index}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    aria-disabled={option.disabled}
                                    onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                                    onClick={() => choose(option)}
                                    className={classes}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {feedback && <FieldMessage variant={feedback.variant} id={messageId}>{feedback.text}</FieldMessage>}
        </div>
    );
}