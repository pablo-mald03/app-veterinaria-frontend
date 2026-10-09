"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Edit3, History, PawPrint, Plus, Power, Trash2, UserRound } from "lucide-react";
import { appointmentService } from "@/services/appointmentService";
import type { AppointmentFormData, AppointmentResponse } from "@/types/appointment";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { useAppointmentCatalogs } from "@/hooks/useAppointmentCatalogs";
import { useAppointmentScope } from "@/hooks/useAppointmentScope";
import { usePaginationState } from "@/hooks/usePaginationState";
import { compareByDateDesc, formatDate, formatHour, matchesFilters, STATUS_OPTIONS, statusLabel, statusVariant } from "@/lib/appointments/utils";
import DataTable from "@/components/ui/table/DataTable";
import RowActions from "@/components/ui/table/RowActions";
import TablePagination from "@/components/ui/table/TablePagination";
import PageSizeSelect, { DEFAULT_PAGE_SIZE } from "@/components/ui/table/PageSizeSelect";
import PageHeader from "@/components/ui/common/PageHeader";
import FilterPanel from "@/components/ui/common/FilterPanel";
import StatusBadgeVariant from "@/components/ui/common/StatusBadgeVariant";
import TextField from "@/components/ui/common/TextField";
import Dropdown from "@/components/ui/common/Dropdown";
import Button from "@/components/ui/common/Button";
import ConfirmDialog from "@/components/ui/dialogs/Confirmdialog";
import type { TableColumn } from "@/components/ui/types/tableTypes";
import AppointmentModal, { type HistoryState } from "@/components/appointments/AppointmentModal";

const EMPTY_HISTORY: HistoryState = { petName: "", rows: [], loading: false };

export default function AppointmentsTable() {
    const { hasPermission } = useAuth();
    const toast = useToast();

    const canCreate = hasPermission("citas:crear");
    const canEdit = hasPermission("citas:editar");
    const canDelete = hasPermission("citas:eliminar");

    const catalogs = useAppointmentCatalogs();
    const { isVeterinarian, myUserId } = useAppointmentScope();

    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        try {
            setError(null);
            const all = await appointmentService.getAll();
            setAppointments(isVeterinarian ? all.filter((a) => a.userId === myUserId) : all);
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudieron cargar las citas.";
            setError(message);
            toast.error(message, "Error al cargar citas");
        } finally {
            setLoading(false);
        }
    }, [toast, isVeterinarian, myUserId]);

    useEffect(() => {
        void reload();
    }, [reload]);

    const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
    const [dateFilter, setDateFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [petFilter, setPetFilter] = useState("");
    const [userFilter, setUserFilter] = useState("");

    const [page, setPage] = usePaginationState([size, dateFilter, statusFilter, petFilter, userFilter].join("|"));

    const filtered = useMemo(
        () =>
            appointments
                .filter((a) =>
                    matchesFilters(a, {
                        date: dateFilter,
                        status: statusFilter,
                        petId: petFilter ? Number(petFilter) : undefined,
                        userId: userFilter ? Number(userFilter) : undefined,
                    }),
                )
                .sort(compareByDateDesc),
        [appointments, dateFilter, statusFilter, petFilter, userFilter],
    );

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size);
    const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
    const rows = filtered.slice(currentPage * size, (currentPage + 1) * size);

    const hasFilters = Boolean(dateFilter || statusFilter || petFilter || userFilter);

    const clearFilters = () => {
        setDateFilter("");
        setStatusFilter("");
        setPetFilter("");
        setUserFilter("");
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"form" | "history">("form");
    const [editingAppointment, setEditingAppointment] = useState<AppointmentResponse | null>(null);
    const [history, setHistory] = useState<HistoryState>(EMPTY_HISTORY);
    const [deleteTarget, setDeleteTarget] = useState<AppointmentResponse | null>(null);

    const handleOpenCreate = () => {
        setEditingAppointment(null);
        setModalMode("form");
        setIsModalOpen(true);
    };

    const handleOpenEdit = (appointment: AppointmentResponse) => {
        setEditingAppointment(appointment);
        setModalMode("form");
        setIsModalOpen(true);
    };

    const handleOpenHistory = async (appointment: AppointmentResponse) => {
        const petName = catalogs.petName(appointment.petId);
        setHistory({ petName, rows: [], loading: true });
        setModalMode("history");
        setIsModalOpen(true);

        try {
            setHistory({ petName, rows: await appointmentService.getPetHistory(appointment.petId), loading: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudo obtener el historial.";
            toast.error(message, "Error al cargar historial");
            setIsModalOpen(false);
        }
    };

    const handleSaveAppointment = async (data: AppointmentFormData) => {
        const { status, diagnosis, treatment, cost, ...request } = data;

        try {
            if (editingAppointment) {
                await appointmentService.update(editingAppointment.id, request);
                if (diagnosis || treatment || cost) {
                    await appointmentService.updateDiagnosis(editingAppointment.id, { diagnosis: diagnosis ?? "", treatment, cost });
                }
                if (status && status !== editingAppointment.status) {
                    await appointmentService.updateStatus(editingAppointment.id, status);
                }
                toast.success("Cita actualizada", catalogs.petName(request.petId));
            } else {
                await appointmentService.create(request);
                toast.success("Cita agendada", catalogs.petName(request.petId));
            }
            setIsModalOpen(false);
            void reload();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al guardar la cita.";
            toast.error(message, "Error al guardar");
            throw err;
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            await appointmentService.delete(deleteTarget.id);
            toast.warning("Cita eliminada", catalogs.petName(deleteTarget.petId));
            setDeleteTarget(null);
            void reload();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al eliminar la cita.";
            toast.error(message, "No se pudo eliminar");
            setDeleteTarget(null);
        }
    };

    const columns: TableColumn<AppointmentResponse>[] = [
        {
            key: "date",
            header: "Fecha y hora",
            className: "font-mono text-xs",
            render: (a) => `${formatDate(a.date)} · ${formatHour(a.hour)}`,
        },
        {
            key: "pet",
            header: "Mascota",
            className: "font-semibold",
            render: (a) => catalogs.petName(a.petId),
        },
        {
            key: "vet",
            header: "Veterinario",
            render: (a) => catalogs.userName(a.userId),
        },
        {
            key: "room",
            header: "Habitación",
            render: (a) => catalogs.roomName(a.roomId),
        },
        {
            key: "description",
            header: "Motivo",
            render: (a) => a.description || <span className="text-text/40">—</span>,
        },
        {
            key: "status",
            header: "Estado",
            render: (a) => <StatusBadgeVariant variant={statusVariant(a.status)}>{statusLabel(a.status)}</StatusBadgeVariant>,
        },
    ];

    return (
        <div className="flex min-h-full flex-col gap-6 bg-white p-8">
            <PageHeader
                title="Agenda de Citas"
                subtitle={isVeterinarian ? "Tus consultas médicas agendadas en Happy Pets." : "Agenda y seguimiento de las consultas médicas de Happy Pets."}
                action={
                    canCreate && (
                        <Button type="button" icon={<Plus className="h-5 w-5" />} onClick={handleOpenCreate}>
                            Agendar Cita
                        </Button>
                    )
                }
            />

            <FilterPanel>
                <TextField
                    label="Fecha"
                    icon={<CalendarDays />}
                    type="date"
                    value={dateFilter}
                    onValueChange={setDateFilter}
                    clearable
                />
                <Dropdown
                    label="Estado"
                    icon={<Power />}
                    options={STATUS_OPTIONS}
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                    placeholder="Todos"
                    clearable
                />
                <Dropdown
                    label="Mascota"
                    icon={<PawPrint />}
                    options={catalogs.petOptions}
                    value={petFilter}
                    onValueChange={setPetFilter}
                    placeholder="Todas"
                    searchable
                    clearable
                />
                {!isVeterinarian && (
                    <Dropdown
                        label="Veterinario"
                        icon={<UserRound />}
                        options={catalogs.userOptions}
                        value={userFilter}
                        onValueChange={setUserFilter}
                        placeholder="Todos"
                        searchable
                        clearable
                    />
                )}
            </FilterPanel>

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="w-full sm:w-56">
                    <PageSizeSelect value={size} onChange={setSize} />
                </div>
                {hasFilters && (
                    <Button type="button" variant="ghost" onClick={clearFilters}>
                        Limpiar filtros
                    </Button>
                )}
            </div>

            <DataTable<AppointmentResponse>
                columns={columns}
                rows={rows}
                getRowKey={(a) => a.id}
                loading={loading || catalogs.loading}
                error={error}
                loadingLabel="Cargando citas..."
                emptyState={{
                    title: "No hay citas para mostrar",
                    description: "Ajusta los filtros o agenda una nueva cita.",
                    icon: <CalendarDays className="h-8 w-8" />,
                }}
                actions={{
                    render: (a) => (
                        <RowActions
                            actions={[
                                {
                                    icon: <History className="h-4 w-4" />,
                                    label: `Historial de ${catalogs.petName(a.petId)}`,
                                    onClick: () => void handleOpenHistory(a),
                                    variant: "default",
                                    visible: true,
                                },
                                {
                                    icon: <Edit3 className="h-4 w-4" />,
                                    label: "Editar cita",
                                    onClick: () => handleOpenEdit(a),
                                    variant: "default",
                                    visible: canEdit,
                                },
                                {
                                    icon: <Trash2 className="h-4 w-4" />,
                                    label: "Eliminar cita",
                                    onClick: () => setDeleteTarget(a),
                                    variant: "danger",
                                    visible: canDelete,
                                },
                            ]}
                        />
                    ),
                }}
            />

            <TablePagination
                page={currentPage}
                size={size}
                totalPages={totalPages}
                totalElements={totalElements}
                itemLabel="citas"
                disabled={loading}
                onPageChange={setPage}
            />

            <AppointmentModal
                open={isModalOpen}
                mode={modalMode}
                editingAppointment={editingAppointment}
                history={history}
                appointments={appointments}
                fixedUserId={isVeterinarian ? myUserId : undefined}
                catalogs={catalogs}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveAppointment}
            />

            <ConfirmDialog
                open={deleteTarget !== null}
                variant="danger"
                title="Eliminar cita"
                description={
                    <>
                        Vas a eliminar la cita de <strong>{deleteTarget ? catalogs.petName(deleteTarget.petId) : ""}</strong>
                        {deleteTarget ? ` del ${formatDate(deleteTarget.date)}` : ""}. Esta acción no se puede deshacer.
                    </>
                }
                confirmLabel="Eliminar"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
