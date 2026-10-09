"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, CalendarClock, CircleCheck, FileText, RefreshCw, Syringe, Tag } from "lucide-react";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import Dropdown, { type DropdownOption } from "@/components/ui/common/Dropdown";
import TextArea from "@/components/ui/common/TextArea";
import TextField from "@/components/ui/common/TextField";
import { useField } from "@/hooks/useField";
import { addDays, formatDate, parseIsoDate, toIsoDate } from "@/lib/vaccination/dates";
import {
    countDoses,
    estimateNextDoseDate,
    findLastDoseDate,
    nextDoseNumber,
} from "@/lib/vaccination/records";
import { isVaccineForSpecies } from "@/lib/vaccination/species";
import {
    VACCINATION_MAX_BACKDATE_DAYS,
    vaccinationDateValidator,
    vaccinationLotSchema,
    vaccinationNotesSchema,
    vaccinationVaccineValidator,
} from "@/schemas/vaccination.schema";
import type { Mascota } from "@/types/pet";
import type { VaccinationInput, VaccinationView } from "@/types/vaccination";
import type { VaccineResponse } from "@/types/vaccination-api";

interface VaccinationFormProps {
    mascota: Mascota;
    /** Carnet actual de la mascota (para saber la dosis que toca y si el esquema ya está completo). */
    records: VaccinationView[];
    catalog: VaccineResponse[];
    loadingCatalog: boolean;
    catalogError: string | null;
    onRetryCatalog: () => void;
    onSubmit: (input: VaccinationInput) => Promise<void>;
    onCancel: () => void;
}

//Formulario para registrar una vacuna aplicada a una mascota
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
    // Fecha más antigua que se puede elegir (el selector también la respeta).
    const oldestDate = addDays(today, -VACCINATION_MAX_BACKDATE_DAYS);

    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    // ---- Vacuna ----
    const vaccineId = useField({
        validator: vaccinationVaccineValidator({ catalog, petSpecies: mascota.especie, records }),
        validateOn: "blur",
    });

    const selectedVaccine = catalog.find((item) => String(item.idVaccine) === vaccineId.value);

    // La dosis la calcula el backend (dosis registradas + 1); aquí solo se adelanta para informar.
    const doseToRegister = selectedVaccine ? nextDoseNumber(records, selectedVaccine.idVaccine) : null;

    // ---- Fecha de aplicación ----
    const appliedAt = useField({
        initialValue: today,
        validator: vaccinationDateValidator({
            petAgeYears: mascota.age,
            previousDoseDate: selectedVaccine ? findLastDoseDate(records, selectedVaccine.idVaccine) : null,
        }),
        validateOn: "blur",
    });

    // ---- Datos opcionales ----
    const lot = useField({ validator: vaccinationLotSchema, validateOn: "blur" });
    const notes = useField({ validator: vaccinationNotesSchema, validateOn: "blur" });

    // ---- Opciones del selector: las que no se pueden usar quedan deshabilitadas con el motivo ----
    const vaccineOptions: DropdownOption[] = useMemo(() => {
        const options = catalog.map((item) => {
            const inactive = !item.status;
            const compatible = isVaccineForSpecies(item.species, mascota.especie);
            const applied = countDoses(records, item.idVaccine);
            const complete = applied >= item.dosesRequired;

            return {
                value: String(item.idVaccine),
                label: item.name,
                hint: inactive
                    ? "Vacuna inactiva"
                    : !compatible
                        ? `No aplica para ${mascota.especie}`
                        : complete
                            ? `Esquema completo (${applied} de ${item.dosesRequired} dosis)`
                            : `${item.species} · ${applied} de ${item.dosesRequired} dosis aplicadas`,
                disabled: inactive || !compatible || complete,
            };
        });

        // Las utilizables primero (el orden original se conserva dentro de cada grupo).
        return [...options.filter((o) => !o.disabled), ...options.filter((o) => o.disabled)];
    }, [catalog, records, mascota.especie]);

    // ---- Resumen de lo que ocurrirá al guardar ----
    const dateIsValid = appliedAt.valid && parseIsoDate(appliedAt.value) !== null;
    const estimatedNextDose =
        selectedVaccine && doseToRegister !== null && dateIsValid
            ? estimateNextDoseDate(selectedVaccine, doseToRegister, appliedAt.value)
            : null;
    const completesScheme =
        selectedVaccine && doseToRegister !== null && vaccineId.valid
            ? doseToRegister >= selectedVaccine.dosesRequired
            : false;

    const isFormValid = vaccineId.valid && appliedAt.valid && lot.valid && notes.valid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        const results = [vaccineId.validate(), appliedAt.validate(), lot.validate(), notes.validate()];
        if (!results.every(Boolean)) return;

        const input: VaccinationInput = {
            idVaccine: Number(vaccineId.value),
            appliedAt: appliedAt.value,
            lot: lot.value.trim() || undefined,
            notes: notes.value.trim() || undefined,
        };

        try {
            setSubmitting(true);
            await onSubmit(input);
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : "No se pudo registrar la vacuna.");
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
                label="Vacuna"
                icon={<Syringe />}
                options={vaccineOptions}
                value={vaccineId.value}
                onValueChange={vaccineId.setValue}
                onBlur={vaccineId.props.onBlur}
                error={vaccineId.error}
                placeholder="Selecciona la vacuna aplicada"
                searchable
                searchPlaceholder="Buscar vacuna..."
                noResultsMessage="No se encontraron vacunas con esa búsqueda."
                emptyMessage="No hay vacunas en el catálogo."
                loading={loadingCatalog}
                disabled={Boolean(catalogError)}
            />

            <TextField
                label="Fecha de aplicación"
                icon={<CalendarCheck />}
                type="date"
                min={oldestDate}
                max={today}
                {...appliedAt.props}
            />

            <TextField
                label="Lote (opcional)"
                icon={<Tag />}
                placeholder="Ej. RAB-2026-01"
                {...lot.props}
            />

            <TextArea
                label="Observaciones (opcional)"
                icon={<FileText />}
                placeholder="Reacciones, indicaciones para el dueño..."
                rows={3}
                {...notes.props}
            />

            {selectedVaccine && doseToRegister !== null && vaccineId.valid && (
                <div className="flex items-start gap-3 rounded-xl bg-mint/50 p-4 text-sm text-text">
                    {completesScheme
                        ? <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                        : <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />}
                    <div>
                        <p className="font-semibold">
                            Se registrará la dosis {doseToRegister} de {selectedVaccine.dosesRequired}
                        </p>
                        {estimatedNextDose ? (
                            <p className="text-xs text-text/70">
                                Próxima dosis estimada: {formatDate(estimatedNextDose)}. La fecha final la calcula el
                                sistema al guardar.
                            </p>
                        ) : (
                            <p className="text-xs text-text/70">Con esta dosis se completa el esquema de la vacuna.</p>
                        )}
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
                    Registrar vacuna
                </Button>
            </div>
        </form>
    );
}
