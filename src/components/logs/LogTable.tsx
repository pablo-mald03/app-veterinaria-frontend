"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Layers, ListOrdered, RefreshCw, ScrollText, X } from "lucide-react";
import { logService } from "@/services/logService";
import type { LogResponse } from "@/types/log";
import { useToast } from "@/components/ui/toast/ToastProvider";
import DataTable from "@/components/ui/table/DataTable";
import PageHeader from "@/components/ui/common/PageHeader";
import Dropdown, { type DropdownOption } from "@/components/ui/common/Dropdown";
import TextField from "@/components/ui/common/TextField";
import Button from "@/components/ui/common/Button";
import type { TableColumn } from "@/components/ui/types/tableTypes";
import LogModuleBadge from "@/components/logs/LogModuleBadge";
import LogPagination from "@/components/logs/LogPagination";

const PAGE_SIZE_OPTIONS: DropdownOption[] = [
    { value: "10", label: "10 por página" },
    { value: "20", label: "20 por página" },
    { value: "50", label: "50 por página" },
];

const DIRECTION_OPTIONS: DropdownOption[] = [
    { value: "desc", label: "Más recientes primero" },
    { value: "asc", label: "Más antiguos primero" },
];

const dateFormatter = new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "medium" });

function formatDate(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}

//Logs table component
export default function LogTable() {
    const toast = useToast();

    const [logs, setLogs] = useState<LogResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState("20");
    const [direction, setDirection] = useState<"asc" | "desc">("desc");
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [moduleFilter, setModuleFilter] = useState("");
    const [createdFrom, setCreatedFrom] = useState("");
    const [createdTo, setCreatedTo] = useState("");

    const [modules, setModules] = useState<string[]>([]);
    const [loadingModules, setLoadingModules] = useState(true);

    // Evita que una respuesta lenta pise a una más reciente
    const requestId = useRef(0);

    const rangeError =
        createdFrom && createdTo && createdFrom > createdTo
            ? "La fecha inicial no puede ser mayor a la final."
            : undefined;

    const loadLogs = useCallback(async () => {
        if (rangeError) return;
        const current = ++requestId.current;
        setLoading(true);
        setLoadError(null);
        try {
            const data = await logService.getAll({
                page,
                size: Number(size),
                direction,
                module: moduleFilter || undefined,
                createdFrom: createdFrom || undefined,
                createdTo: createdTo || undefined,
            });
            if (current !== requestId.current) return;
            setLogs(data.logs ?? []);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (err) {
            if (current !== requestId.current) return;
            const message = err instanceof Error ? err.message : "No se pudieron cargar los logs.";
            setLoadError(message);
            toast.error(message, "Error al cargar logs");
        } finally {
            if (current === requestId.current) setLoading(false);
        }
    }, [page, size, direction, moduleFilter, createdFrom, createdTo, rangeError, toast]);

    useEffect(() => {
        void loadLogs();
    }, [loadLogs]);

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

    // Cualquier cambio de filtro regresa a la primera página
    const withReset = <T,>(setter: (value: T) => void) => (value: T) => {
        setPage(0);
        setter(value);
    };

    const hasFilters = Boolean(moduleFilter || createdFrom || createdTo);

    const clearFilters = () => {
        setPage(0);
        setModuleFilter("");
        setCreatedFrom("");
        setCreatedTo("");
    };

    const columns: TableColumn<LogResponse>[] = [
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
                        onClick={() => void loadLogs()}
                        disabled={loading || Boolean(rangeError)}
                        className="border border-secondary"
                    >
                        Actualizar
                    </Button>
                }
            />

            <div className="grid gap-4 rounded-2xl border border-secondary/50 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
                <Dropdown
                    label="Módulo"
                    icon={<Layers />}
                    options={moduleOptions}
                    value={moduleFilter}
                    onValueChange={withReset(setModuleFilter)}
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
                    onValueChange={withReset(setCreatedFrom)}
                    error={rangeError}
                />
                <TextField
                    label="Hasta"
                    type="date"
                    icon={<CalendarDays />}
                    value={createdTo}
                    min={createdFrom || undefined}
                    onValueChange={withReset(setCreatedTo)}
                />
                <Dropdown
                    label="Orden"
                    icon={<ListOrdered />}
                    options={DIRECTION_OPTIONS}
                    value={direction}
                    onValueChange={(v) => {
                        setPage(0);
                        setDirection(v === "asc" ? "asc" : "desc");
                    }}
                />
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="w-full sm:w-56">
                    <Dropdown
                        label="Registros"
                        options={PAGE_SIZE_OPTIONS}
                        value={size}
                        onValueChange={(v) => {
                            setPage(0);
                            setSize(v || "20");
                        }}
                    />
                </div>
                {hasFilters && (
                    <Button type="button" variant="ghost" icon={<X className="h-4 w-4" />} onClick={clearFilters}>
                        Limpiar filtros
                    </Button>
                )}
            </div>

            <DataTable<LogResponse>
                columns={columns}
                rows={logs}
                getRowKey={(l) => l.id}
                loading={loading}
                error={loadError}
                loadingLabel="Cargando logs..."
                emptyState={{
                    title: "No hay logs para mostrar",
                    description: "Ajusta los filtros o el rango de fechas.",
                    icon: <ScrollText className="h-8 w-8" />,
                }}
            />

            <LogPagination
                page={page}
                size={Number(size)}
                totalPages={totalPages}
                totalElements={totalElements}
                disabled={loading}
                onPageChange={setPage}
            />
        </div>
    );
}
