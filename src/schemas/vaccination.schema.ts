import { z } from "zod";
import {
    formatDate,
    parseIsoDate,
    startOfToday,
    subtractYears,
} from "@/lib/vaccination/dates";
import { isVaccineForSpecies } from "@/lib/vaccination/species";
import type { VaccineResponse } from "@/types/vaccination-api";

// Validaciones del formulario "Registrar vacuna".
//
// Se hacen en el frontend por si el backend todavía no las tiene; cuando las agregue,
// estas siguen sirviendo como validación temprana (el backend siempre manda).
// Los campos simples usan zod (como pet.schema.ts); los que dependen de otros campos
// (catálogo, carnet, edad de la mascota) son funciones que devuelven el mensaje de error.

// ---- Campos simples ----

export const vaccinationLotSchema = z
    .string()
    .trim()
    .max(50, "Máximo 50 caracteres.")
    .regex(/^[A-Za-z0-9\-_/. ]*$/, "El lote solo admite letras, números y los símbolos - _ / .");

export const vaccinationNotesSchema = z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.");

// ---- Campos que dependen de otros datos ----

interface VaccineContext {
    catalog: VaccineResponse[];
    petSpecies: string;
}

/** La vacuna debe existir en el catálogo, estar activa y aplicar a la especie de la mascota. */
export function vaccinationVaccineValidator({ catalog, petSpecies }: VaccineContext) {
    return (value: string): string | undefined => {
        if (!value) return "Selecciona la vacuna aplicada.";

        const vaccine = catalog.find((item) => String(item.idVaccine) === value);
        if (!vaccine) return "La vacuna seleccionada no existe en el catálogo.";
        if (!vaccine.status) return "Esta vacuna está inactiva en el catálogo.";
        if (!isVaccineForSpecies(vaccine.species, petSpecies)) {
            return `Esta vacuna no aplica para la especie ${petSpecies}.`;
        }

        return undefined;
    };
}

/** Entero entre 1 y 99 que no se haya registrado ya para esa vacuna en esta mascota. */
export function vaccinationDoseValidator(takenDoses: number[]) {
    return (value: string): string | undefined => {
        const text = value.trim();

        if (!text) return "El número de dosis es obligatorio.";
        if (!/^\d+$/.test(text)) return "La dosis debe ser un número entero.";

        const dose = Number(text);
        if (dose < 1) return "La dosis mínima es 1.";
        if (dose > 99) return "La dosis máxima es 99.";
        if (takenDoses.includes(dose)) return `La dosis ${dose} de esta vacuna ya está registrada.`;

        return undefined;
    };
}

interface DateContext {
    /** Edad de la mascota en años (la fecha no puede ser anterior a su nacimiento estimado). */
    petAgeYears: number;
    /** Fecha de la dosis anterior de la misma vacuna; la nueva debe ser posterior. */
    previousDoseDate: string | null;
}

/** Fecha real, no futura, posterior al nacimiento estimado y a la dosis anterior. */
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
                return `Debe ser posterior a la dosis anterior (${formatDate(previousDoseDate)}).`;
            }
        }

        return undefined;
    };
}
