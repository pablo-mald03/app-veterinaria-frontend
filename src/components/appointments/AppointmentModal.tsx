"use client";

import Modal from "@/components/ui/common/Modal";
import Spinner from "@/components/ui/common/Spinner";
import StatusBadgeVariant from "@/components/ui/common/StatusBadgeVariant";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import { formatDate, formatHour, statusLabel, statusVariant } from "@/lib/appointments/utils";
import type { AppointmentCatalogs } from "@/hooks/useAppointmentCatalogs";
import type { AppointmentFormData, AppointmentResponse } from "@/types/appointment";

export interface HistoryState {
    petName: string;
    rows: AppointmentResponse[];
    loading: boolean;
}

interface AppointmentModalProps {
    open: boolean;
    mode: "form" | "history";
    editingAppointment: AppointmentResponse | null;
    history: HistoryState;
    appointments: AppointmentResponse[];
    fixedUserId?: number;
    catalogs: AppointmentCatalogs;
    onClose: () => void;
    onSubmit: (data: AppointmentFormData) => Promise<void>;
}

export default function AppointmentModal({
                                             open,
                                             mode,
                                             editingAppointment,
                                             history,
                                             appointments,
                                             fixedUserId,
                                             catalogs,
                                             onClose,
                                             onSubmit,
                                         }: AppointmentModalProps) {
    if (mode === "history") {
        return (
            <Modal
                open={open}
                onClose={onClose}
                size="lg"
                title="Historial Médico"
                subtitle={history.petName ? `Citas anteriores de ${history.petName}.` : undefined}
            >
                {history.loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <Spinner />
                    </div>
                ) : history.rows.length === 0 ? (
                    <p className="py-8 text-center text-sm text-text/60">No hay citas registradas para esta mascota.</p>
                ) : (
                    <ul className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
                        {history.rows.map((item) => (
                            <li key={item.id} className="flex flex-col gap-1.5 rounded-xl border border-mint p-3 text-sm">
                                <div className="flex items-center justify-between gap-2 border-b border-mint pb-2">
                                    <span className="font-semibold">
                                        {formatDate(item.date)} · {formatHour(item.hour)}
                                    </span>
                                    <StatusBadgeVariant variant={statusVariant(item.status)}>{statusLabel(item.status)}</StatusBadgeVariant>
                                </div>
                                <p>
                                    <strong>Veterinario:</strong> {catalogs.userName(item.userId)} · <strong>Habitación:</strong> {catalogs.roomName(item.roomId)}
                                </p>
                                {item.description && <p><strong>Motivo:</strong> {item.description}</p>}
                                {item.diagnosis && <p><strong>Diagnóstico:</strong> {item.diagnosis}</p>}
                                {item.treatment && <p><strong>Tratamiento:</strong> {item.treatment}</p>}
                            </li>
                        ))}
                    </ul>
                )}
            </Modal>
        );
    }

    const isEditing = Boolean(editingAppointment);

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            title={isEditing ? "Editar Cita" : "Agendar Nueva Cita"}
            subtitle={isEditing ? "Actualiza la cita y registra el diagnóstico." : "Programa una consulta para una mascota."}
        >
            <AppointmentForm editingAppointment={editingAppointment} appointments={appointments} fixedUserId={fixedUserId} catalogs={catalogs} onSubmit={onSubmit} onCancel={onClose} />
        </Modal>
    );
}
