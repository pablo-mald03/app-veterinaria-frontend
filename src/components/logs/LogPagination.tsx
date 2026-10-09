"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface LogPaginationProps {
    page: number;
    totalPages: number;
    totalElements: number;
    size: number;
    disabled?: boolean;
    onPageChange: (page: number) => void;
}

//Pagination footer for the logs table
export default function LogPagination({ page, totalPages, totalElements, size, disabled = false, onPageChange }: LogPaginationProps) {
    if (totalElements === 0) return null;

    const from = page * size + 1;
    const to = Math.min((page + 1) * size, totalElements);
    const isFirst = page <= 0;
    const isLast = page >= totalPages - 1;

    const btn =
        "flex cursor-pointer items-center gap-1 rounded-xl border border-secondary bg-white px-3 py-2 text-sm font-semibold text-text transition-all hover:border-primary hover:bg-mint disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-secondary disabled:hover:bg-white";

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text/70">
                Mostrando <strong className="text-text">{from}–{to}</strong> de{" "}
                <strong className="text-text">{totalElements}</strong> registros
            </p>
            <div className="flex items-center gap-2">
                <button type="button" className={btn} disabled={disabled || isFirst} onClick={() => onPageChange(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                </button>
                <span className="px-2 text-sm text-text/70">
                    Página <strong className="text-text">{page + 1}</strong> de {Math.max(totalPages, 1)}
                </span>
                <button type="button" className={btn} disabled={disabled || isLast} onClick={() => onPageChange(page + 1)}>
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
