"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import FieldMessage from "@/components/ui/common/FieldMessage";
import Spinner from "@/components/ui/common/Spinner";
import { useClickOutside } from "@/hooks/useClickOutside";
import { FIELD_STYLES, type FieldVariant } from "../types/fieldVariants";

export interface DropdownOption {
    value: string;
    label: string;
    hint?: string;
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
    searchable?: boolean;
    searchPlaceholder?: string;
    noResultsMessage?: string;
}

//Custom dropdown component (listbox with keyboard included)
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
    searchable = false,
    searchPlaceholder = "Buscar...",
    noResultsMessage = "No se encontraron resultados.",
}: DropdownProps) {
    const autoId = useId();
    const triggerId = id ?? autoId;
    const listId = `${triggerId}-list`;
    const messageId = `${triggerId}-message`;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [query, setQuery] = useState("");

    // Lista visible = filtra por query si searchable está activo
    const visibleOptions = useMemo(() => {
        if (!searchable || query.trim() === "") return options;
        const q = query.trim().toLowerCase();
        return options.filter(
            (o) =>
                o.label.toLowerCase().includes(q) ||
                (o.hint?.toLowerCase().includes(q) ?? false)
        );
    }, [options, query, searchable]);

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

    // Al abrir con búsqueda, enfocar el input de búsqueda
    useEffect(() => {
        if (open && searchable) {
            // setTimeout para esperar al render del input
            const t = setTimeout(() => searchRef.current?.focus(), 0);
            return () => clearTimeout(t);
        }
    }, [open, searchable]);

    // Resetear la query al cerrar
    useEffect(() => {
        if (!open && query !== "") setQuery("");
    }, [open, query]);

    useEffect(() => {
        if (open && activeIndex >= 0) {
            listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
        }
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
        if (visibleOptions.length === 0) return;
        let next = activeIndex === -1 ? (delta === 1 ? -1 : visibleOptions.length) : activeIndex;

        for (let i = 0; i < visibleOptions.length; i++) {
            next = (next + delta + visibleOptions.length) % visibleOptions.length;
            if (!visibleOptions[next].disabled) {
                setActiveIndex(next);
                return;
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        // Si estamos en modo searchable y el foco está en el input, dejamos que escriba
        if (searchable && e.target === searchRef.current) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                move(1);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                move(-1);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (activeIndex >= 0 && visibleOptions[activeIndex]) {
                    choose(visibleOptions[activeIndex]);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
            }
            return;
        }

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
                else if (activeIndex >= 0 && visibleOptions[activeIndex]) choose(visibleOptions[activeIndex]);
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
                    <div
                        className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-secondary bg-white shadow-lg motion-safe:animate-field-message"
                    >
                        {searchable && (
                            <div className="relative flex items-center border-b border-mint">
                                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-accent" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={searchPlaceholder}
                                    className="w-full rounded-t-xl bg-white py-2.5 pl-9 pr-3 text-sm text-text outline-none placeholder:text-placeholder"
                                />
                            </div>
                        )}

                        <ul
                            ref={listRef}
                            id={listId}
                            role="listbox"
                            onMouseDown={(e) => e.preventDefault()}
                            className="max-h-60 overflow-y-auto p-1"
                        >
                            {loading && (
                                <li role="presentation" className="flex justify-center py-3"><Spinner className="h-5 w-5" /></li>
                            )}

                            {!loading && visibleOptions.length === 0 && (
                                <li role="presentation" className="px-3 py-2 text-sm text-text-muted">
                                    {searchable && query.trim() !== "" ? noResultsMessage : emptyMessage}
                                </li>
                            )}

                            {!loading && visibleOptions.map((option, index) => {
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
                                        <div className="min-w-0">
                                            <p className="truncate">{option.label}</p>
                                            {option.hint && <p className="truncate text-xs text-text-muted">{option.hint}</p>}
                                        </div>
                                        {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>

            {feedback && <FieldMessage variant={feedback.variant} id={messageId}>{feedback.text}</FieldMessage>}
        </div>
    );
}