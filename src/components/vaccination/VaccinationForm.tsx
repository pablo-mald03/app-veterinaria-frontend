"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, CalendarClock, FileText, Hash, RefreshCw, Syringe, Tag } from "lucide-react";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import Dropdown, { type DropdownOption } from "@/components/ui/common/Dropdown";
import TextArea from "@/components/ui/common/TextArea";
import TextField from "@/components/ui/common/TextField";
import { useField } from "@/hooks/useField";
import { digitsOnly } from "@/lib/forms/transform";
import { addDays, formatDate, parseIsoDate, toIsoDate } from "@/lib/vaccination/dates";
import {
    findPreviousDoseDate,
    getDoseWarning,
    suggestNextDose,
    takenDosesOf,
} from "@/lib/vaccination/records";
import { isVaccineForSpecies } from "@/lib/vaccination/species";
import {
    vaccinationDateValidator,
    vaccinationDoseValidator,
    vaccinationLotSchema,
    vaccinationNotesSchema,
    vaccinationVaccineValidator,
} from "@/schemas/vaccination.schema";
import type { Mascota } from "@/types/pet";
import type {
    VaccinationRequest,
    VaccinationResponse,
    VaccineResponse,
} from "@/types/vaccination-api";

interface VaccinationFormProps {
    mascota: Mascota;
    /** Carnet actual de la mascota (para evitar dosis duplicadas y sugerir la siguiente). */
    records: VaccinationResponse[];
    catalog: VaccineResponse[];
    loadingCatalog: boolean;
    catalogError: string | null;
    onRetryCatalog: () => void;
    onSubmit: (request: VaccinationRequest) => Promise<void>;
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

    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    // ---- Vacuna ----
    const vaccineId = useField({
        validator: vaccinationVaccineValidator({ catalog, petSpecies: mascota.especie }),
        validateOn: "blur",
    });

    const selectedVaccine = catalog.find((item) => String(item.idVaccine) === vaccineId.value);
    const takenDoses = selectedVaccine ? takenDosesOf(records, selectedVaccine.idVaccine) : [];

    // ---- Dosis ----
    const dose = useField({
        initialValue: "1",
        validator: vaccinationDoseValidator(takenDoses),
        validateOn: "blur",
        transform: digitsOnly,
    });

    const doseNumber = /^\d+$/.test(dose.value) ? Number(dose.value) : null;

    // ---- Fecha de aplicación ----
    const appliedAt = useField({
        initialValue: today,
        validator: vaccinationDateValidator({
            petAgeYears: mascota.age,
            previousDoseDate:
                selectedVaccine && doseNumber !== null
                    ? findPreviousDoseDate(records, selectedVaccine.idVaccine, doseNumber)
                    : null,
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

            return {
                value: String(item.idVaccine),
                label: item.name,
                hint: inactive
                    ? "Vacuna inactiva"
                    : !compatible
                        ? `No aplica para ${mascota.especie}`
                        : `${item.species} · ${item.dosesRequired} dosis`,
                disabled: inactive || !compatible,
            };
        });

        // Las utilizables primero (el orden original se conserva dentro de cada grupo).
        return [...options.filter((o) => !o.disabled), ...options.filter((o) => o.disabled)];
    }, [catalog, mascota.especie]);

    // ---- Avisos informativos (no bloquean el guardado) ----
    const doseWarning =
        selectedVaccine && doseNumber !== null && dose.valid
            ? getDoseWarning(doseNumber, selectedVaccine.dosesRequired, takenDoses)
            : undefined;

    const estimatedNextDose =
        selectedVaccine?.intervalDays && appliedAt.valid && parseIsoDate(appliedAt.value)
            ? addDays(appliedAt.value, selectedVaccine.intervalDays)
            : null;

    const isFormValid =
        vaccineId.valid && dose.valid && appliedAt.valid && lot.valid && notes.valid;

    const handleVaccineChange = (value: string) => {
        vaccineId.setValue(value);
        // Propone la siguiente dosis según lo que ya tenga registrado en el carnet.
        if (value) dose.setValue(String(suggestNextDose(records, Number(value))));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        const results = [
            vaccineId.validate(),
            dose.validate(),
            appliedAt.validate(),
            lot.validate(),
            notes.validate(),
        ];

        if (!results.every(Boolean)) return;

        const request: VaccinationRequest = {
            idVaccine: Number(vaccineId.value),
            doseNumber: Number(dose.value),
            appliedAt: appliedAt.value,
            lot: lot.value.trim() || undefined,
            notes: notes.value.trim() || undefined,
        };

        try {
            setSubmitting(true);
            await onSubmit(request);
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
                onValueChange={handleVaccineChange}
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                    label="Número de dosis"
                    icon={<Hash />}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    placeholder="1"
                    message={doseWarning}
                    messageVariant="warning"
                    {...dose.props}
                />

                <TextField
                    label="Fecha de aplicación"
                    icon={<CalendarCheck />}
                    type="date"
                    max={today}
                    {...appliedAt.props}
                />
            </div>

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

            {estimatedNextDose && selectedVaccine?.intervalDays && (
                <div className="flex items-start gap-3 rounded-xl bg-mint/50 p-4 text-sm text-text">
                    <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                    <div>
                        <p className="font-semibold">Próxima dosis estimada: {formatDate(estimatedNextDose)}</p>
                        <p className="text-xs text-text/70">
                            Se calcula con el intervalo de {selectedVaccine.intervalDays} días de la vacuna.
                            La fecha final la confirma el sistema al guardar.
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
                    Registrar vacuna
                </Button>
            </div>
        </form>
    );
}
