"use client";

import { RefreshCw } from "lucide-react";
import { EmptyState, TableColumn } from "../types/tableTypes";

interface DataTableProps<T> {
    columns: TableColumn<T>[];
    rows: T[];
    getRowKey: (row: T) => string | number;
    loading?: boolean;
    error?: string | null;
    emptyState: EmptyState;
    loadingLabel?: string;
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
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={`px-6 py-3 ${ALIGN_CLASSES[col.align ?? "left"]} ${col.className ?? ""}`}
                                        style={col.width ? { width: col.width } : undefined}
                                    >
                                        {col.header}
                                    </th>
                                ))}
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
                                                className={`px-6 py-4 ${ALIGN_CLASSES[col.align ?? "left"]} ${col.className ?? ""}`}
                                            >
                                                {col.render
                                                    ? col.render(row)
                                                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                                            </td>
                                        ))}
                                        {showActions && (
                                            <td className="px-6 py-4">
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