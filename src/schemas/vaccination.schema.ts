import { z } from "zod";
import {
    formatDate,
    parseIsoDate,
    startOfToday,
    subtractYears,
} from "@/lib/vaccination/dates";
import { isTreatmentForSpecies } from "@/lib/vaccination/species";
import type { TreatmentResponse } from "@/types/vaccination-api";

// Validaciones del formulario "Registrar tratamiento".
//
// Se hacen en el frontend por si el backend todavía no las tiene; cuando las agregue,
// estas siguen sirviendo como validación temprana (el backend siempre manda).
// Los campos simples usan zod (como pet.schema.ts); los que dependen de otros campos
// (catálogo, edad de la mascota) son funciones que devuelven el mensaje de error.

// ---- Campos simples ----

export const vaccinationNotesSchema = z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.");

// ---- Campos que dependen de otros datos ----

interface TreatmentContext {
    catalog: TreatmentResponse[];
    petSpecies: string;
}

/** El tratamiento debe existir en el catálogo, estar activo y aplicar a la especie de la mascota. */
export function vaccinationTreatmentValidator({ catalog, petSpecies }: TreatmentContext) {
    return (value: string): string | undefined => {
        if (!value) return "Selecciona el tratamiento aplicado.";

        const treatment = catalog.find((item) => String(item.idTreatment) === value);
        if (!treatment) return "El tratamiento seleccionado no existe en el catálogo.";
        if (!treatment.status) return "Este tratamiento está inactivo en el catálogo.";
        if (!isTreatmentForSpecies(treatment.species, petSpecies)) {
            return `Este tratamiento no aplica para la especie ${petSpecies}.`;
        }

        return undefined;
    };
}

interface DateContext {
    /** Edad de la mascota en años (la fecha no puede ser anterior a su nacimiento estimado). */
    petAgeYears: number;
    /** Fecha de la última aplicación del mismo tratamiento; la nueva debe ser posterior. */
    previousDoseDate: string | null;
}

/** Fecha real, no futura, posterior al nacimiento estimado y a la aplicación anterior. */
export function vaccinationDateValidator({ petAgeYears, previousDoseDate }: DateContext) {
    return (value: string): string | undefined => {
        if (!value) return "La fecha de aplicación es obligatoria.";

        const date = parseIsoDate(value);
        if (!date) return "Ingresa una fecha válida.";

        const today = startOfToday();
        if (date.getTime() > today.getTime()) return "La fecha de aplicación no puede ser futura.";

        // La edad se guarda redondeada: se da un año de margen para no rechazar fechas válidas.
        const earliest = subtractYears(today, Math.ceil(Math.max(petAgeYears, 0)) + 1);
        if (date.getTime() < earliest.getTime()) {
            return "La fecha es anterior al nacimiento estimado de la mascota.";
        }

        if (previousDoseDate) {
            const previous = parseIsoDate(previousDoseDate.slice(0, 10));
            if (previous && date.getTime() <= previous.getTime()) {
                return `Debe ser posterior a la aplicación anterior (${formatDate(previousDoseDate)}).`;
            }
        }

        return undefined;
    };
}
