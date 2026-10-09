"use client";

import { useState } from "react";
import { FileText, Plus, RefreshCw } from "lucide-react";
import Can from "@/components/auth/Can";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import Spinner from "@/components/ui/common/Spinner";
import { useToast } from "@/components/ui/toast/ToastProvider";
import ConsultationModal from "@/components/consultation/ConsultationModal";
import { formatCost } from "@/lib/consultation/money";
import { createConsultation } from "@/services/consultationService";
import type { Mascota } from "@/types/pet";
import type { ConsultationInput, ConsultationView } from "@/types/consultation";

interface ConsultationHistoryTabProps {
    mascota: Mascota;
    history: ConsultationView[];
    loading: boolean;
    error: string | null;
    doctorId: number | null;
    /** Vuelve a pedir el historial (se llama después de registrar una consulta). */
    onReload: () => void;
}

//Pestaña "Consultas" del expediente: historial clínico + botón para registrar
export default function ConsultationHistoryTab({
    mascota,
    history,
    loading,
    error,
    doctorId,
    onReload,
}: ConsultationHistoryTabProps) {
    const toast = useToast();
    const [formOpen, setFormOpen] = useState(false);

    const handleSave = async (input: ConsultationInput) => {
        try {
            if (doctorId === null) {
                throw new Error("No se pudo identificar al veterinario de la sesión actual.");
            }

            await createConsultation(Number(mascota.id), input, doctorId);
            toast.success("Consulta registrada", mascota.name);
            setFormOpen(false);
            onReload();
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudo registrar la consulta.";
            toast.error(message, "Error al registrar consulta");
            throw err;
        }
    };

    return (
        <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-text">Historial de consultas</h3>

                <Can permission="citas:editar">
                    <Button
                        type="button"
                        icon={<Plus className="h-4 w-4" />}
                        onClick={() => setFormOpen(true)}
                    >
                        Registrar consulta
                    </Button>
                </Can>
            </div>

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-text/70">
                    <Spinner className="h-5 w-5" />
                    <span>Cargando historial...</span>
                </div>
            ) : error ? (
                <div className="flex flex-col gap-2">
                    <Alert variant="error">{error}</Alert>
                    <Button
                        type="button"
                        variant="ghost"
                        icon={<RefreshCw className="h-4 w-4" />}
                        onClick={onReload}
                    >
                        Reintentar
                    </Button>
                </div>
            ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-secondary py-10 text-center">
                    <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
                    <p className="text-sm font-medium text-text">Aún no hay consultas registradas</p>
                    <p className="text-xs text-text/60">
                        Cuando se registre una consulta para esta mascota, va a aparecer acá.
                    </p>
                </div>
            ) : (
                <ul className="flex flex-col divide-y divide-mint">
                    {history.map((consulta) => (
                        <li key={consulta.idAppointment} className="py-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-semibold text-text">{consulta.reason}</span>
                                <span className="text-xs text-text/60">
                                    {consulta.date} · {consulta.hour.slice(0, 5)}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-text/70">Diagnóstico: {consulta.diagnosis}</p>
                            <p className="mt-1 text-sm text-text/70">Tratamiento: {consulta.treatment}</p>
                            <p className="mt-1 text-sm font-semibold text-accent">{formatCost(consulta.cost)}</p>
                        </li>
                    ))}
                </ul>
            )}

            <ConsultationModal open={formOpen} mascota={mascota} onClose={() => setFormOpen(false)} onSave={handleSave} />
        </div>
    );
}
