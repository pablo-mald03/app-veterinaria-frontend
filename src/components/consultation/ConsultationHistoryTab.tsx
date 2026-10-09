"use client";

import { FileText, RefreshCw } from "lucide-react";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import Spinner from "@/components/ui/common/Spinner";
import { formatCost } from "@/lib/consultation/money";
import type { Mascota } from "@/types/pet";
import type { ConsultationView } from "@/types/consultation";

interface ConsultationHistoryTabProps {
    mascota: Mascota;
    history: ConsultationView[];
    loading: boolean;
    error: string | null;
    onReload: () => void;
}

// Pestaña "Consultas" del expediente: solo lectura del historial clínico.
// Registrar una consulta es responsabilidad de otro módulo (no se trabaja aquí);
// esta pestaña únicamente lista las consultas ya registradas para la mascota.
export default function ConsultationHistoryTab({ mascota, history, loading, error, onReload }: ConsultationHistoryTabProps) {
    return (
        <div>
            <h3 className="mb-3 text-sm font-bold text-text">Historial de consultas</h3>

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
                        Cuando se registre una consulta para {mascota.name}, va a aparecer acá.
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
        </div>
    );
}