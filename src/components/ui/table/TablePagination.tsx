"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
    page: number; // 0-based
    size: number;
    totalPages: number;
    totalElements: number;
    itemLabel?: string;
    disabled?: boolean;
    onPageChange: (page: number) => void;
}

const BUTTON_CLASSES =
    "flex cursor-pointer items-center gap-1 rounded-xl border border-secondary bg-white px-3 py-2 text-sm font-semibold text-text transition-all hover:border-primary hover:bg-mint disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-secondary disabled:hover:bg-white";

//Reusable pagination footer for server-side paginated tables
export default function TablePagination({ page, size, totalPages, totalElements, itemLabel = "registros", disabled = false, onPageChange }: TablePaginationProps) {
    if (totalElements === 0) return null;

    const from = page * size + 1;
    const to = Math.min((page + 1) * size, totalElements);

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text/70">
                Mostrando <strong className="text-text">{from}–{to}</strong> de{" "}
                <strong className="text-text">{totalElements}</strong> {itemLabel}
            </p>
            <div className="flex items-center gap-2">
                <button type="button" className={BUTTON_CLASSES} disabled={disabled || page <= 0} onClick={() => onPageChange(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                </button>
                <span className="px-2 text-sm text-text/70">
                    Página <strong className="text-text">{page + 1}</strong> de {Math.max(totalPages, 1)}
                </span>
                <button type="button" className={BUTTON_CLASSES} disabled={disabled || page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
