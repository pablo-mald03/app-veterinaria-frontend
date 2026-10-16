"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, RefreshCw } from "lucide-react";
import { EmptyState, SortState, TableColumn } from "../types/tableTypes";

interface DataTableProps<T> {
    columns: TableColumn<T>[];
    rows: T[];
    getRowKey: (row: T) => string | number;
    loading?: boolean;
    error?: string | null;
    emptyState: EmptyState;
    loadingLabel?: string;
    sort?: SortState;
    onSortChange?: (sort: SortState) => void;
    actions?: {
        header?: string;
        render: (row: T) => React.ReactNode;
    };
}

const ALIGN_CLASSES: Record<NonNullable<TableColumn<unknown>["align"]>, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
};

//Reutilizable table component
export default function DataTable<T>({
                                         columns,
                                         rows,
                                         getRowKey,
                                         loading = false,
                                         error = null,
                                         emptyState,
                                         loadingLabel = "Cargando...",
                                         sort,
                                         onSortChange,
                                         actions,
                                     }: DataTableProps<T>) {
    const showActions = Boolean(actions);
    const totalCols = columns.length + (showActions ? 1 : 0);

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-md">
            {loading ? (
                <div className="flex items-center justify-center gap-2 p-14 text-sm text-text/70">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    <span>{loadingLabel}</span>
                </div>
            ) : error ? (
                <div className="p-14 text-center text-sm text-red-600">{error}</div>
            ) : rows.length === 0 ? (
                <div className="m-4 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-secondary py-14 text-center">
                    {emptyState.icon && <div className="mb-2 text-accent">{emptyState.icon}</div>}
                    <p className="text-sm font-medium text-text">{emptyState.title}</p>
                    {emptyState.description && (
                        <p className="text-xs text-text/60">{emptyState.description}</p>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-mint text-xs font-semibold uppercase tracking-wide text-text/70">
                        <tr>
                            {columns.map((col) => {
                                const sortable = Boolean(col.sortable && onSortChange);
                                const direction = sort?.key === col.key ? sort.direction : undefined;
                                const SortIcon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown;

                                return (
                                    <th
                                        key={col.key}
                                        aria-sort={sortable ? (direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none") : undefined}
                                        className={`px-6 py-3 ${ALIGN_CLASSES[col.align ?? "left"]} ${col.className ?? ""}`}
                                        style={col.width ? { width: col.width } : undefined}
                                    >
                                        {sortable ? (
                                            // Una columna nueva empieza ascendente; al volver a pulsarla alterna el sentido
                                            <button
                                                type="button"
                                                onClick={() => onSortChange!({ key: col.key, direction: direction === "asc" ? "desc" : "asc" })}
                                                className="inline-flex items-center gap-1.5 rounded font-semibold uppercase tracking-wide transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
                                            >
                                                {col.header}
                                                <SortIcon className={`h-3.5 w-3.5 ${direction ? "text-accent" : "opacity-40"}`} aria-hidden="true" />
                                            </button>
                                        ) : (
                                            col.header
                                        )}
                                    </th>
                                );
                            })}
                            {showActions && (
                                <th className="px-6 py-3 text-right">{actions!.header ?? "Acciones"}</th>
                            )}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-mint">
                        {rows.map((row) => {
                            const key = getRowKey(row);
                            return (
                                <tr key={key} className="transition-colors hover:bg-mint/40">
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`px-6 py-4 text-text ${ALIGN_CLASSES[col.align ?? "left"]} ${col.className ?? ""}`}
                                        >
                                            {col.render
                                                ? col.render(row)
                                                : String((row as Record<string, unknown>)[col.key] ?? "")}
                                        </td>
                                    ))}
                                    {showActions && (
                                        <td className="px-6 py-4 text-text">
                                            <div className="flex items-center justify-end gap-2">
                                                {actions!.render(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}