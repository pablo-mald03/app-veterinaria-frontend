"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Layers, ListOrdered, RefreshCw, ScrollText, X } from "lucide-react";
import { logService } from "@/services/logService";
import type { LogResponse } from "@/types/log";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { usePaginationState } from "@/hooks/usePaginationState";
import DataTable from "@/components/ui/table/DataTable";
import TablePagination from "@/components/ui/table/TablePagination";
import PageSizeSelect, { DEFAULT_PAGE_SIZE } from "@/components/ui/table/PageSizeSelect";
import PageHeader from "@/components/ui/common/PageHeader";
import FilterPanel from "@/components/ui/common/FilterPanel";
import Dropdown, { type DropdownOption } from "@/components/ui/common/Dropdown";
import TextField from "@/components/ui/common/TextField";
import Button from "@/components/ui/common/Button";
import type { TableColumn } from "@/components/ui/types/tableTypes";
import LogModuleBadge from "@/components/logs/LogModuleBadge";

const DIRECTION_OPTIONS: DropdownOption[] = [
    { value: "desc", label: "Más recientes primero" },
    { value: "asc", label: "Más antiguos primero" },
];

const dateFormatter = new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "medium" });

function formatDate(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}

const COLUMNS: TableColumn<LogResponse>[] = [
    {
        key: "createdAt",
        header: "Fecha",
        className: "whitespace-nowrap text-xs",
        render: (l) => formatDate(l.createdAt),
    },
    {
        key: "module",
        header: "Módulo",
        render: (l) => <LogModuleBadge module={l.module} />,
    },
    {
        key: "action",
        header: "Acción",
        className: "font-semibold",
    },
    {
        key: "detail",
        header: "Detalle",
        className: "max-w-md",
        render: (l) => <p className="whitespace-pre-wrap break-words text-sm text-text/80">{l.detail}</p>,
    },
    {
        key: "user",
        header: "Usuario",
        render: (l) => (
            <>
                <div className="font-semibold text-text">@{l.userRegistry}</div>
                <div className="font-mono text-xs text-text/60">{l.userIdentification}</div>
            </>
        ),
    },
];

//Logs table component
export default function LogTable() {
    const toast = useToast();

    const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
    const [direction, setDirection] = useState<"asc" | "desc">("desc");
    const [moduleFilter, setModuleFilter] = useState("");
    const [createdFrom, setCreatedFrom] = useState("");
    const [createdTo, setCreatedTo] = useState("");

    const [modules, setModules] = useState<string[]>([]);
    const [loadingModules, setLoadingModules] = useState(true);

    const rangeError =
        createdFrom && createdTo && createdFrom > createdTo
            ? "La fecha inicial no puede ser mayor a la final."
            : undefined;

    const [page, setPage] = usePaginationState([size, direction, moduleFilter, createdFrom, createdTo].join("|"));

    const fetchLogs = useCallback(
        () => logService.getAll({ page, size, direction, module: moduleFilter, createdFrom, createdTo }),
        [page, size, direction, moduleFilter, createdFrom, createdTo],
    );

    const { rows, totalPages, totalElements, loading, error, reload } = usePagedQuery(fetchLogs, {
        enabled: !rangeError,
        errorTitle: "Error al cargar logs",
    });

    useEffect(() => {
        let active = true;
        logService
            .getModules()
            .then((data) => active && setModules(data))
            .catch((err) => {
                if (!active) return;
                const message = err instanceof Error ? err.message : "No se pudieron cargar los módulos.";
                toast.error(message, "Error al cargar módulos");
            })
            .finally(() => active && setLoadingModules(false));
        return () => {
            active = false;
        };
    }, [toast]);

    const moduleOptions = useMemo<DropdownOption[]>(
        () => modules.map((m) => ({ value: m, label: m })),
        [modules],
    );

    const hasFilters = Boolean(moduleFilter || createdFrom || createdTo);

    const clearFilters = () => {
        setModuleFilter("");
        setCreatedFrom("");
        setCreatedTo("");
    };

    return (
        <div className="flex min-h-full flex-col gap-6 bg-white p-8">
            <PageHeader
                title="Bitácora de Logs"
                subtitle="Registro de la actividad realizada en el sistema de Happy Pets."
                action={
                    <Button
                        type="button"
                        variant="ghost"
                        icon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
                        onClick={reload}
                        disabled={loading || Boolean(rangeError)}
                        className="border border-secondary"
                    >
                        Actualizar
                    </Button>
                }
            />

            <FilterPanel>
                <Dropdown
                    label="Módulo"
                    icon={<Layers />}
                    options={moduleOptions}
                    value={moduleFilter}
                    onValueChange={setModuleFilter}
                    placeholder="Todos los módulos"
                    loading={loadingModules}
                    emptyMessage="No hay módulos registrados."
                    clearable
                    searchable
                />
                <TextField
                    label="Desde"
                    type="date"
                    icon={<CalendarDays />}
                    value={createdFrom}
                    max={createdTo || undefined}
                    onValueChange={setCreatedFrom}
                    error={rangeError}
                />
                <TextField
                    label="Hasta"
                    type="date"
                    icon={<CalendarDays />}
                    value={createdTo}
                    min={createdFrom || undefined}
                    onValueChange={setCreatedTo}
                />
                <Dropdown
                    label="Orden"
                    icon={<ListOrdered />}
                    options={DIRECTION_OPTIONS}
                    value={direction}
                    onValueChange={(v) => setDirection(v === "asc" ? "asc" : "desc")}
                />
            </FilterPanel>

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="w-full sm:w-56">
                    <PageSizeSelect value={size} onChange={setSize} />
                </div>
                {hasFilters && (
                    <Button type="button" variant="ghost" icon={<X className="h-4 w-4" />} onClick={clearFilters}>
                        Limpiar filtros
                    </Button>
                )}
            </div>

            <DataTable<LogResponse>
                columns={COLUMNS}
                rows={rows}
                getRowKey={(l) => l.id}
                loading={loading}
                error={error}
                loadingLabel="Cargando logs..."
                emptyState={{
                    title: "No hay logs para mostrar",
                    description: "Ajusta los filtros o el rango de fechas.",
                    icon: <ScrollText className="h-8 w-8" />,
                }}
            />

            <TablePagination
                page={page}
                size={size}
                totalPages={totalPages}
                totalElements={totalElements}
                disabled={loading}
                onPageChange={setPage}
            />
        </div>
    );
}