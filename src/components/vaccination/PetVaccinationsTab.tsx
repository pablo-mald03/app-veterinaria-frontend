"use client";

import { useState } from "react";
import { Plus, RefreshCw, Syringe } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Can from "@/components/auth/Can";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import Spinner from "@/components/ui/common/Spinner";
import { useToast } from "@/components/ui/toast/ToastProvider";
import VaccinationModal from "@/components/vaccination/VaccinationModal";
import VaccinationStatusBadge from "@/components/vaccination/VaccinationStatusBadge";
import { daysFromToday, describeDue, formatDate } from "@/lib/vaccination/dates";
import { latestPerVaccine, sortByAppliedDesc } from "@/lib/vaccination/records";
import { createPetVaccination } from "@/services/vaccinationService";
import type { Mascota } from "@/types/pet";
import type { VaccinationInput, VaccinationView } from "@/types/vaccination";

interface PetVaccinationsTabProps {
    mascota: Mascota;
    records: VaccinationView[];
    loading: boolean;
    error: string | null;
    /** Vuelve a pedir el carnet (se llama después de registrar una vacuna). */
    onReload: () => void;
}

//Pestaña "Vacunas" del expediente: carnet de vacunación + botón para registrar
export default function PetVaccinationsTab({ mascota, records, loading, error, onReload }: PetVaccinationsTabProps) {
    const toast = useToast();
    const { user } = useAuth();
    const [formOpen, setFormOpen] = useState(false);

    // Solo la última dosis de cada vacuna tiene estado vigente; las anteriores quedaron superadas.
    const latestIds = new Set(latestPerVaccine(records).map((record) => record.idVaccination));
    const rows = sortByAppliedDesc(records);

    const handleSave = async (input: VaccinationInput) => {
        try {
            // El backend exige el id del veterinario que aplicó la vacuna: el del usuario con sesión.
            const doctorId = Number(user?.id);
            if (!Number.isInteger(doctorId)) {
                throw new Error("No se pudo identificar al veterinario de la sesión actual.");
            }

            await createPetVaccination(Number(mascota.id), input, doctorId);
            toast.success("Vacuna registrada", mascota.name);
            setFormOpen(false);
            onReload();
        } catch (err) {
            const message = err instanceof Error ? err.message : "No se pudo registrar la vacuna.";
            toast.error(message, "Error al registrar vacuna");
            throw err;
        }
    };

    return (
        <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-text">Carnet de vacunación</h3>

                <Can permission="vacunacion:crear">
                    <Button
                        type="button"
                        icon={<Plus className="h-4 w-4" />}
                        onClick={() => setFormOpen(true)}
                    >
                        Registrar vacuna
                    </Button>
                </Can>
            </div>

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-text/70">
                    <Spinner className="h-5 w-5" />
                    <span>Cargando carnet...</span>
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
            ) : rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-secondary py-10 text-center">
                    <Syringe className="h-6 w-6 text-accent" aria-hidden="true" />
                    <p className="text-sm font-medium text-text">Aún no hay vacunas registradas</p>
                    <p className="text-xs text-text/60">
                        Cuando se registre una vacuna para esta mascota, va a aparecer acá.
                    </p>
                </div>
            ) : (
                <ul className="flex flex-col divide-y divide-mint">
                    {rows.map((record) => {
                        const isLatest = latestIds.has(record.idVaccination);
                        const days = record.nextDoseDate ? daysFromToday(record.nextDoseDate) : null;

                        return (
                            <li key={record.idVaccination} className="flex items-start justify-between gap-4 py-3">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-semibold text-text">{record.vaccineName}</span>
                                        <span className="rounded-full bg-mint px-2 py-0.5 text-xs font-semibold text-accent">
                                            Dosis {record.doseNumber}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm text-text/70">
                                        Aplicada el {formatDate(record.appliedAt)}
                                    </p>

                                    {record.lot && <p className="mt-0.5 text-xs text-text/60">Lote: {record.lot}</p>}
                                    {record.notes && <p className="mt-0.5 text-xs text-text/60">{record.notes}</p>}
                                </div>

                                <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                                    <VaccinationStatusBadge kind={isLatest ? record.status : "APLICADA"} />

                                    {isLatest && record.nextDoseDate && (
                                        <>
                                            <p className="text-xs text-text/70">Próxima: {formatDate(record.nextDoseDate)}</p>
                                            <p className="text-xs font-medium text-accent">{describeDue(days)}</p>
                                        </>
                                    )}

                                    {isLatest && !record.nextDoseDate && record.schemeComplete && (
                                        <p className="text-xs font-medium text-accent">Esquema completo</p>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <VaccinationModal
                open={formOpen}
                mascota={mascota}
                records={records}
                onClose={() => setFormOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
}
