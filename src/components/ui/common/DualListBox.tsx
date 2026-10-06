"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export interface DualListBoxItem {
    id: number;
    label: string;
    hint?: string;
    group?: string;
}

interface DualListBoxProps {
    available: DualListBoxItem[];
    assigned: DualListBoxItem[];
    onChange: (assigned: DualListBoxItem[]) => void;
    availableLabel?: string;
    assignedLabel?: string;
    searchPlaceholder?: string;
    emptyAvailableMessage?: string;
    emptyAssignedMessage?: string;
    disabled?: boolean;
}

function groupItems(items: DualListBoxItem[]): { group: string | null; items: DualListBoxItem[] }[] {
    const groups: { group: string | null; items: DualListBoxItem[] }[] = [];
    const indexByGroup = new Map<string | null, number>();

    for (const item of items) {
        const key = item.group ?? null;
        let idx = indexByGroup.get(key);

        if (idx === undefined) {
            idx = groups.length;
            groups.push({ group: key, items: [] });
            indexByGroup.set(key, idx);
        }

        groups[idx].items.push(item);
    }

    return groups;
}

//Generic dual list box comonent
export default function DualListBox({
    available,
    assigned,
    onChange,
    availableLabel = "Disponibles",
    assignedLabel = "Asignados",
    searchPlaceholder = "Buscar...",
    emptyAvailableMessage = "No hay elementos disponibles.",
    emptyAssignedMessage = "No hay elementos asignados.",
    disabled = false,
}: DualListBoxProps) {
    const [search, setSearch] = useState("");
    const [selectedLeft, setSelectedLeft] = useState<Set<number>>(new Set());
    const [selectedRight, setSelectedRight] = useState<Set<number>>(new Set());

    // Filter by search on both sides
    const filteredAvailable = useMemo(() => {
        if (!search.trim()) return available;
        const q = search.toLowerCase();
        return available.filter(
            (i) => i.label.toLowerCase().includes(q) || (i.hint?.toLowerCase().includes(q) ?? false)
        );
    }, [available, search]);

    const filteredAssigned = useMemo(() => {
        if (!search.trim()) return assigned;
        const q = search.toLowerCase();
        return assigned.filter(
            (i) => i.label.toLowerCase().includes(q) || (i.hint?.toLowerCase().includes(q) ?? false)
        );
    }, [assigned, search]);

    const groupedAvailable = useMemo(() => groupItems(filteredAvailable), [filteredAvailable]);
    const groupedAssigned = useMemo(() => groupItems(filteredAssigned), [filteredAssigned]);

    // --- Selection helpers ---

    const toggleIn = (
        set: Set<number>,
        id: number,
        additive: boolean
    ): Set<number> => {
        const next = new Set(additive ? set : []);
        if (additive && next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    };

    const handleItemClick = (
        id: number,
        side: "left" | "right",
        e: React.MouseEvent
    ) => {
        const additive = e.ctrlKey || e.metaKey || e.shiftKey;
        if (side === "left") setSelectedLeft((s) => toggleIn(s, id, additive));
        else setSelectedRight((s) => toggleIn(s, id, additive));
    };

    // --- Move helpers ---

    const moveRight = () => {
        if (disabled || selectedLeft.size === 0) return;
        const movedIds = selectedLeft;
        const remaining = available.filter((i) => !movedIds.has(i.id));
        const moving = available.filter((i) => movedIds.has(i.id));
        onChange([...assigned, ...moving]);
        setSelectedLeft(new Set());
        setSelectedRight((prev) => {
            const next = new Set(prev);
            for (const id of movedIds) next.delete(id);
            return next;
        });
        void remaining;
    };

    const moveLeft = () => {
        if (disabled || selectedRight.size === 0) return;
        const movedIds = selectedRight;
        const next = assigned.filter((i) => !movedIds.has(i.id));
        onChange(next);
        setSelectedRight(new Set());
    };

    const moveAllRight = () => {
        if (disabled || filteredAvailable.length === 0) return;
        const movingIds = new Set(filteredAvailable.map((i) => i.id));
        const remaining = available.filter((i) => !movingIds.has(i.id));
        void remaining;
        onChange([...assigned, ...filteredAvailable]);
        setSelectedLeft(new Set());
    };

    const moveAllLeft = () => {
        if (disabled || filteredAssigned.length === 0) return;
        const movingIds = new Set(filteredAssigned.map((i) => i.id));
        onChange(assigned.filter((i) => !movingIds.has(i.id)));
        setSelectedRight(new Set());
    };

    const handleDoubleClick = (item: DualListBoxItem, side: "left" | "right") => {
        if (disabled) return;
        if (side === "left") {
            onChange([...assigned, item]);
            setSelectedLeft((s) => {
                const next = new Set(s);
                next.delete(item.id);
                return next;
            });
        } else {
            onChange(assigned.filter((i) => i.id !== item.id));
            setSelectedRight((s) => {
                const next = new Set(s);
                next.delete(item.id);
                return next;
            });
        }
    };

    // --- Render helpers ---

    const renderList = (
        groups: ReturnType<typeof groupItems>,
        selected: Set<number>,
        side: "left" | "right",
        emptyMessage: string
    ) => {
        if (groups.length === 0) {
            return (
                <div className="flex h-full items-center justify-center px-4 py-10 text-center text-xs text-text-muted">
                    {emptyMessage}
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-3 p-2">
                {groups.map(({ group, items }) => (
                    <div key={group ?? "__ungrouped"} className="flex flex-col gap-1">
                        {group && (
                            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                                {group}
                            </p>
                        )}
                        {items.map((item) => {
                            const isSelected = selected.has(item.id);
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    disabled={disabled}
                                    onClick={(e) => handleItemClick(item.id, side, e)}
                                    onDoubleClick={() => handleDoubleClick(item, side)}
                                    className={[
                                        "cursor-pointer rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                                        isSelected
                                            ? "border-primary bg-mint text-text"
                                            : "border-transparent text-text hover:bg-mint/60",
                                        disabled ? "cursor-not-allowed opacity-60" : "",
                                    ].filter(Boolean).join(" ")}
                                >
                                    <p className="font-medium">{item.label}</p>
                                    {item.hint && <p className="text-xs text-text-muted">{item.hint}</p>}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-accent" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    disabled={disabled}
                    className="w-full rounded-xl border border-secondary bg-white py-2.5 pl-10 pr-3 text-sm text-text outline-none transition-all placeholder:text-placeholder focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-mint/40"
                />
            </div>

            {/* Columns */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr]">
                {/* Left column */}
                <div className="flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-secondary bg-white">
                    <div className="border-b border-mint px-3 py-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                        {availableLabel}
                        <span className="ml-1 text-text/40">({filteredAvailable.length})</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">{renderList(groupedAvailable, selectedLeft, "left", emptyAvailableMessage)}</div>
                </div>

                {/* Center: move buttons */}
                <div className="flex flex-row justify-center gap-2 md:flex-col md:justify-center">
                    <button
                        type="button"
                        onClick={moveRight}
                        disabled={disabled || selectedLeft.size === 0}
                        aria-label="Asignar seleccionados"
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-secondary bg-white text-accent transition-colors hover:bg-mint disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={moveLeft}
                        disabled={disabled || selectedRight.size === 0}
                        aria-label="Quitar seleccionados"
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-secondary bg-white text-accent transition-colors hover:bg-mint disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                </div>

                {/* Right column */}
                <div className="flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-secondary bg-white">
                    <div className="border-b border-mint px-3 py-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                        {assignedLabel}
                        <span className="ml-1 text-text/40">({filteredAssigned.length})</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">{renderList(groupedAssigned, selectedRight, "right", emptyAssignedMessage)}</div>
                </div>
            </div>

            {/* Move-all shortcuts */}
            <div className="flex flex-wrap justify-center gap-2 text-xs">
                <button
                    type="button"
                    onClick={moveAllRight}
                    disabled={disabled || filteredAvailable.length === 0}
                    className="cursor-pointer rounded-lg px-3 py-1 font-semibold text-accent transition-colors hover:bg-mint disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Asignar todos →
                </button>
                <button
                    type="button"
                    onClick={moveAllLeft}
                    disabled={disabled || filteredAssigned.length === 0}
                    className="cursor-pointer rounded-lg px-3 py-1 font-semibold text-accent transition-colors hover:bg-mint disabled:cursor-not-allowed disabled:opacity-40"
                >
                    ← Quitar todos
                </button>
            </div>
        </div>
    );
}