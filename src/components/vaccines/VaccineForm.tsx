"use client";

import { useState } from "react";
import { CalendarClock, FileText, Hash, PawPrint, Syringe } from "lucide-react";
import Alert from "@/components/ui/common/Alert";
import Button from "@/components/ui/common/Button";
import TextArea from "@/components/ui/common/TextArea";
import TextField from "@/components/ui/common/TextField";
import { useField } from "@/hooks/useField";
import { digitsOnly } from "@/lib/forms/transform";
import {
    vaccineDescriptionSchema,
    vaccineDosesValidator,
    vaccineIntervalValidator,
    vaccineNameSchema,
    vaccineSpeciesSchema,
} from "@/schemas/vaccineCatalog.schema";
import type { VaccineCatalogInput } from "@/types/vaccines/vaccineCatalog";

interface VaccineFormProps {
    onSubmit: (input: VaccineCatalogInput) => Promise<void>;
    onCancel: () => void;
}

//Formulario para crear una vacuna en el catálogo
export default function VaccineForm({ onSubmit, onCancel }: VaccineFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const name = useField({ validator: vaccineNameSchema, validateOn: "blur" });
    const description = useField({ validator: vaccineDescriptionSchema, validateOn: "blur" });
    const species = useField({ validator: vaccineSpeciesSchema, validateOn: "blur" });
    const doses = useField({ initialValue: "1", validator: vaccineDosesValidator, validateOn: "blur", transform: digitsOnly });
    const interval = useField({ validator: vaccineIntervalValidator, validateOn: "blur", transform: digitsOnly });

    const isFormValid = name.valid && description.valid && species.valid && doses.valid && interval.valid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        const results = [name.validate(), description.validate(), species.validate(), doses.validate(), interval.validate()];
        if (!results.every(Boolean)) return;

        const input: VaccineCatalogInput = {
            name: name.value.trim(),
            description: description.value.trim(),
            species: species.value.trim(),
            dosesRequired: Number(doses.value),
            intervalDays: interval.value.trim() ? Number(interval.value) : null,
            status: true,
        };

        try {
            setSubmitting(true);
            await onSubmit(input);
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : "No se pudo crear la vacuna.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {generalError && <Alert variant="error">{generalError}</Alert>}

            <TextField label="Nombre" icon={<Syringe />} placeholder="Ej. Rabia" {...name.props} />

            <TextArea
                label="Descripción"
                icon={<FileText />}
                placeholder="Ej. Vacuna antirrábica anual"
                rows={2}
                {...description.props}
            />

            <TextField
                label="Especie"
                icon={<PawPrint />}
                placeholder="Ej. PERRO, GATO"
                message="Usa PERRO, GATO o AVE (separados por coma si aplica a varias)."
                {...species.props}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                    label="Dosis del esquema"
                    icon={<Hash />}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    placeholder="1"
                    {...doses.props}
                />

                <TextField
                    label="Intervalo entre dosis (días)"
                    icon={<CalendarClock />}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    placeholder="Opcional"
                    message="Déjalo vacío si no aplica (esquema de una sola dosis)."
                    {...interval.props}
                />
            </div>

            <div className="mt-4 flex justify-end gap-3 border-t border-mint pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
                    Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={submitting} loadingLabel="Guardando..." disabled={!isFormValid || submitting}>
                    Crear vacuna
                </Button>
            </div>
        </form>
    );
}
