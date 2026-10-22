"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, CalendarClock, CircleCheck, FileText, RefreshCw, Syringe } from "lucide-react";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import Dropdown, { type DropdownOption } from "@/components/ui/common/Dropdown";
import TextArea from "@/components/ui/common/TextArea";
import TextField from "@/components/ui/common/TextField";
import { useField } from "@/hooks/useField";
import { formatCost } from "@/lib/consultation/money";
import { formatDate, parseIsoDate, toIsoDate } from "@/lib/vaccination/dates";
import {
    countApplications,
    estimateNextDoseDate,
    findLastApplicationDate,
    nextApplicationNumber,
} from "@/lib/vaccination/records";
import { isTreatmentForSpecies } from "@/lib/vaccination/species";
import {
    vaccinationDateValidator,
    vaccinationNotesSchema,
    vaccinationTreatmentValidator,
} from "@/schemas/vaccination.schema";
import type { Mascota } from "@/types/pet";
import type { VaccinationInput, VaccinationView } from "@/types/vaccination";
import type { TreatmentResponse } from "@/types/vaccination-api";

interface VaccinationFormProps {
    mascota: Mascota;
    /** Carnet actual de la mascota (para saber qué aplicación toca y cuándo fue la última). */
    records: VaccinationView[];
    catalog: TreatmentResponse[];
    loadingCatalog: boolean;
    catalogError: string | null;
    onRetryCatalog: () => void;
    onSubmit: (input: VaccinationInput) => Promise<void>;
    onCancel: () => void;
}

//Formulario para registrar un tratamiento aplicado a una mascota
export default function VaccinationForm({
                                            mascota,
                                            records,
                                            catalog,
                                            loadingCatalog,
                                            catalogError,
                                            onRetryCatalog,
                                            onSubmit,
                                            onCancel,
                                        }: VaccinationFormProps) {
    const today = toIsoDate(new Date());

    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    // ---- Tratamiento ----
    const treatmentId = useField({
        validator: vaccinationTreatmentValidator({ catalog, petSpecies: mascota.especie }),
        validateOn: "blur",
    });

    const selectedTreatment = catalog.find((item) => String(item.idTreatment) === treatmentId.value);

    // El número lo calcula el backend (aplicaciones registradas + 1); aquí solo se adelanta para informar.
    const applicationToRegister = selectedTreatment ? nextApplicationNumber(records, selectedTreatment.idTreatment) : null;

    // ---- Fecha de aplicación ----
    const appliedAt = useField({
        initialValue: today,
        validator: vaccinationDateValidator({
            petAgeYears: mascota.age,
            previousDoseDate: selectedTreatment ? findLastApplicationDate(records, selectedTreatment.idTreatment) : null,
        }),
        validateOn: "blur",
    });

    // ---- Dato opcional ----
    const notes = useField({ validator: vaccinationNotesSchema, validateOn: "blur" });

    // ---- Opciones del selector: las que no se pueden usar quedan deshabilitadas con el motivo ----
    const treatmentOptions: DropdownOption[] = useMemo(() => {
        const options = catalog.map((item) => {
            const inactive = !item.status;
            const compatible = isTreatmentForSpecies(item.species, mascota.especie);
            const applied = countApplications(records, item.idTreatment);

            return {
                value: String(item.idTreatment),
                label: item.name,
                hint: inactive
                    ? "Tratamiento inactivo"
                    : !compatible
                        ? `No aplica para ${mascota.especie}`
                        : `${item.species.join(", ")} · ${applied === 0 ? "Sin aplicaciones previas" : `${applied} ${applied === 1 ? "aplicación previa" : "aplicaciones previas"}`}`,
                disabled: inactive || !compatible,
            };
        });

        // Las utilizables primero (el orden original se conserva dentro de cada grupo).
        return [...options.filter((o) => !o.disabled), ...options.filter((o) => o.disabled)];
    }, [catalog, records, mascota.especie]);

    // ---- Resumen de lo que ocurrirá al guardar ----
    const dateIsValid = appliedAt.valid && parseIsoDate(appliedAt.value) !== null;
    const estimatedNextDose =
        selectedTreatment && dateIsValid ? estimateNextDoseDate(selectedTreatment, appliedAt.value) : null;

    const isFormValid = treatmentId.valid && appliedAt.valid && notes.valid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        const results = [treatmentId.validate(), appliedAt.validate(), notes.validate()];
        if (!results.every(Boolean)) return;

        const input: VaccinationInput = {
            idTreatment: Number(treatmentId.value),
            appliedAt: appliedAt.value,
            notes: notes.value.trim() || undefined,
        };

        try {
            setSubmitting(true);
            await onSubmit(input);
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : "No se pudo registrar el tratamiento.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {generalError && <Alert variant="error">{generalError}</Alert>}

            {catalogError && (
                <div className="flex flex-col gap-2">
                    <Alert variant="error">{catalogError}</Alert>
                    <Button
                        type="button"
                        variant="ghost"
                        icon={<RefreshCw className="h-4 w-4" />}
                        onClick={onRetryCatalog}
                    >
                        Reintentar
                    </Button>
                </div>
            )}

            <Dropdown
                label="Tratamientos"
                icon={<Syringe />}
                options={treatmentOptions}
                value={treatmentId.value}
                onValueChange={treatmentId.setValue}
                onBlur={treatmentId.props.onBlur}
                error={treatmentId.error}
                placeholder="Selecciona el tratamiento aplicado"
                searchable
                searchPlaceholder="Buscar tratamiento..."
                noResultsMessage="No se encontraron tratamientos con esa búsqueda."
                emptyMessage="No hay tratamientos en el catálogo."
                loading={loadingCatalog}
                disabled={Boolean(catalogError)}
            />

            <TextField
                label="Fecha de aplicación"
                icon={<CalendarCheck />}
                type="date"
                max={today}
                {...appliedAt.props}
            />

            <TextArea
                label="Observaciones (opcional)"
                icon={<FileText />}
                placeholder="Reacciones, indicaciones para el dueño..."
                rows={3}
                {...notes.props}
            />

            {selectedTreatment && applicationToRegister !== null && treatmentId.valid && (
                <div className="flex items-start gap-3 rounded-xl bg-mint/50 p-4 text-sm text-text">
                    {estimatedNextDose
                        ? <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                        : <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />}
                    <div>
                        <p className="font-semibold">Se registrará la aplicación {applicationToRegister}</p>
                        {estimatedNextDose ? (
                            <p className="text-xs text-text/70">
                                Próxima aplicación estimada: {formatDate(estimatedNextDose)}. La fecha final la calcula el
                                sistema al guardar.
                            </p>
                        ) : (
                            <p className="text-xs text-text/70">Este tratamiento es de aplicación única: no genera próxima fecha.</p>
                        )}
                        <p className="mt-1 text-xs text-text/70">
                            Costo estimado: {formatCost(selectedTreatment.estimatedCost)}. Los productos del tratamiento
                            se descuentan del inventario al guardar.
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-4 flex justify-end gap-3 border-t border-mint pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    loadingLabel="Guardando..."
                    disabled={!isFormValid || submitting || loadingCatalog}
                >
                    Registrar tratamiento
                </Button>
            </div>
        </form>
    );
}
