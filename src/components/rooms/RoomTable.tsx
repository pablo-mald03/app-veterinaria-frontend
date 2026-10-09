"use client";

import { useCallback, useState } from "react";
import { Ban, DoorOpen, Edit3, Hash, MapPin, Plus, Power, ShieldCheck } from "lucide-react";
import { roomService } from "@/services/roomService";
import type { RoomDetailResponse, RoomRequest, RoomResponse } from "@/types/room";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { usePaginationState } from "@/hooks/usePaginationState";
import { digitsOnly } from "@/lib/forms/transform";
import DataTable from "@/components/ui/table/DataTable";
import RowActions from "@/components/ui/table/RowActions";
import TablePagination from "@/components/ui/table/TablePagination";
import PageSizeSelect, { DEFAULT_PAGE_SIZE } from "@/components/ui/table/PageSizeSelect";
import PageHeader from "@/components/ui/common/PageHeader";
import FilterPanel from "@/components/ui/common/FilterPanel";
import StatusBadge from "@/components/ui/common/StatusBadge";
import TextField from "@/components/ui/common/TextField";
import Dropdown, { type DropdownOption } from "@/components/ui/common/Dropdown";
import Button from "@/components/ui/common/Button";
import ConfirmDialog from "@/components/ui/dialogs/Confirmdialog";
import type { TableColumn } from "@/components/ui/types/tableTypes";
import RoomModal from "@/components/rooms/RoomModal";

type PendingAction = { type: "deactivate" | "reactivate"; room: RoomResponse } | null;

const STATUS_OPTIONS: DropdownOption[] = [
    { value: "true", label: "Activas" },
    { value: "false", label: "Inactivas" },
];

const COLUMNS: TableColumn<RoomResponse>[] = [
    {
        key: "number",
        header: "Número",
        className: "font-mono text-xs",
        render: (r) => `N° ${r.number}`,
    },
    {
        key: "name",
        header: "Habitación",
        className: "font-semibold",
    },
    {
        key: "location",
        header: "Ubicación",
        render: (r) => r.location || <span className="text-text/40">—</span>,
    },
    {
        key: "status",
        header: "Estado",
        render: (r) => <StatusBadge active={r.status} activeLabel="Activa" inactiveLabel="Inactiva" />,
    },
];

//Rooms table component
export default function RoomTable() {
    const { hasPermission } = useAuth();
    const toast = useToast();

    const canCreate = hasPermission("salas:crear");
    const canEdit = hasPermission("salas:editar");
    const canDeactivate = hasPermission("salas:eliminar");

    const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
    const [nameFilter, setNameFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [numberFilter, setNumberFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const name = useDebouncedValue(nameFilter.trim());
    const location = useDebouncedValue(locationFilter.trim());
    const number = useDebouncedValue(numberFilter);

    const [page, setPage] = usePaginationState([size, name, location, number, statusFilter].join("|"));

    const fetchRooms = useCallback(
        () =>
            roomService.getAll({
                page,
                size,
                name,
                location,
                number: number ? Number(number) : undefined,
                status: statusFilter ? statusFilter === "true" : undefined,
            }),
        [page, size, name, location, number, statusFilter],
    );

    const { rows, totalPages, totalElements, loading, error, reload } = usePagedQuery(fetchRooms, {
        errorTitle: "Error al cargar habitaciones",
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomDetailResponse | null>(null);
    const [openingId, setOpeningId] = useState<number | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);

    const hasFilters = Boolean(nameFilter || locationFilter || numberFilter || statusFilter);

    const clearFilters = () => {
        setNameFilter("");
        setLocationFilter("");
        setNumberFilter("");
        setStatusFilter("");
    };

    const handleOpenCreate = () => {
        setEditingRoom(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = async (room: RoomResponse) => {
        if (openingId !== null) return;
        setOpeningId(room.id);
        try {
            setEditingRoom(await roomService.getById(room.id));
            setIsModalOpen(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudo cargar la habitación.";
            toast.error(message, "Error al cargar habitación");
        } finally {
            setOpeningId(null);
        }
    };

    const handleSaveRoom = async (data: RoomRequest) => {
        try {
            if (editingRoom) {
                await roomService.update(editingRoom.id, data);
                toast.success("Habitación actualizada", data.name);
            } else {
                await roomService.create(data);
                toast.success("Habitación registrada", data.name);
            }
            setIsModalOpen(false);
            reload();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al guardar la habitación.";
            toast.error(message, "Error al guardar");
            throw err;
        }
    };

    const handleConfirmAction = async () => {
        if (!pendingAction) return;
        const { type, room } = pendingAction;

        try {
            if (type === "deactivate") {
                await roomService.deactivate(room.id);
                toast.warning(`${room.name} desactivada`, "Habitación inhabilitada");
            } else {
                await roomService.reactivate(room.id);
                toast.success(`${room.name} reactivada`, "Habitación habilitada");
            }
            setPendingAction(null);
            reload();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al actualizar el estado.";
            toast.error(message, "Operación fallida");
            throw err;
        }
    };

    const isDeactivating = pendingAction?.type === "deactivate";

    return (
        <div className="flex min-h-full flex-col gap-6 bg-white p-8">
            <PageHeader
                title="Gestión de Habitaciones"
                subtitle="Administración de las habitaciones y áreas de atención de Happy Pets."
                action={
                    canCreate && (
                        <Button type="button" icon={<Plus className="h-5 w-5" />} onClick={handleOpenCreate}>
                            Registrar Habitación
                        </Button>
                    )
                }
            />

            <FilterPanel>
                <TextField
                    label="Nombre"
                    icon={<DoorOpen />}
                    placeholder="Buscar por nombre..."
                    value={nameFilter}
                    onValueChange={setNameFilter}
                    clearable
                />
                <TextField
                    label="Ubicación"
                    icon={<MapPin />}
                    placeholder="Buscar por ubicación..."
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                    clearable
                />
                <TextField
                    label="Número"
                    icon={<Hash />}
                    placeholder="Ej. 101"
                    inputMode="numeric"
                    maxLength={9}
                    value={numberFilter}
                    onValueChange={(v) => setNumberFilter(digitsOnly(v))}
                    clearable
                />
                <Dropdown
                    label="Estado"
                    icon={<Power />}
                    options={STATUS_OPTIONS}
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                    placeholder="Todas"
                    clearable
                />
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

            <DataTable<RoomResponse>
                columns={COLUMNS}
                rows={rows}
                getRowKey={(r) => r.id}
                loading={loading}
                error={error}
                loadingLabel="Cargando habitaciones..."
                emptyState={{
                    title: "No hay habitaciones para mostrar",
                    description: "Ajusta los filtros o registra una nueva habitación.",
                    icon: <DoorOpen className="h-8 w-8" />,
                }}
                actions={
                    canEdit || canDeactivate
                        ? {
                            render: (r) => (
                                <RowActions
                                    actions={[
                                        {
                                            icon: <Edit3 className="h-4 w-4" />,
                                            label: `Editar ${r.name}`,
                                            onClick: () => void handleOpenEdit(r),
                                            variant: "default",
                                            visible: canEdit,
                                        },
                                        {
                                            icon: <Ban className="h-4 w-4" />,
                                            label: `Desactivar ${r.name}`,
                                            onClick: () => setPendingAction({ type: "deactivate", room: r }),
                                            variant: "danger",
                                            visible: canDeactivate && r.status,
                                        },
                                        {
                                            icon: <ShieldCheck className="h-4 w-4" />,
                                            label: `Reactivar ${r.name}`,
                                            onClick: () => setPendingAction({ type: "reactivate", room: r }),
                                            variant: "success",
                                            visible: canDeactivate && !r.status,
                                        },
                                    ]}
                                />
                            ),
                        }
                        : undefined
                }
            />

            <TablePagination
                page={page}
                size={size}
                totalPages={totalPages}
                totalElements={totalElements}
                itemLabel="habitaciones"
                disabled={loading}
                onPageChange={setPage}
            />

            <RoomModal
                open={isModalOpen}
                editingRoom={editingRoom}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveRoom}
            />

            <ConfirmDialog
                open={pendingAction !== null}
                variant={isDeactivating ? "danger" : "warning"}
                title={isDeactivating ? "Desactivar habitación" : "Reactivar habitación"}
                description={
                    isDeactivating ? (
                        <>
                            Vas a desactivar <strong>{pendingAction?.room.name}</strong>. Dejará de estar disponible,
                            pero podrás reactivarla después.
                        </>
                    ) : (
                        <>
                            Vas a reactivar <strong>{pendingAction?.room.name}</strong>. Volverá a estar disponible.
                        </>
                    )
                }
                confirmLabel={isDeactivating ? "Desactivar" : "Reactivar"}
                onConfirm={handleConfirmAction}
                onCancel={() => setPendingAction(null)}
            />
        </div>
    );
}
