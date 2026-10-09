import { z } from "zod";
import {
    formatDate,
    parseIsoDate,
    startOfToday,
    subtractYears,
    toIsoDate,
} from "@/lib/vaccination/dates";
import { countDoses } from "@/lib/vaccination/records";
import { isVaccineForSpecies } from "@/lib/vaccination/species";
import type { VaccinationView } from "@/types/vaccination";
import type { VaccineResponse } from "@/types/vaccination-api";

// Validaciones del formulario "Registrar vacuna".
//
// Se hacen en el frontend por si el backend todavía no las tiene; cuando las agregue,
// estas siguen sirviendo como validación temprana (el backend siempre manda).
// Los campos simples usan zod (como pet.schema.ts); los que dependen de otros campos
// (catálogo, carnet, edad de la mascota) son funciones que devuelven el mensaje de error.

/**
 * Cuántos días hacia atrás se permite registrar la fecha de aplicación.
 * 0 = solo se acepta la fecha de hoy (la vacuna se registra el día que se aplica).
 * Para dar margen (por ejemplo, registrar al día siguiente) basta con subir este número.
 */
export const VACCINATION_MAX_BACKDATE_DAYS = 0;

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
    /** Carnet actual: sirve para saber si el esquema de esa vacuna ya está completo. */
    records: VaccinationView[];
}

/**
 * La vacuna debe existir en el catálogo, estar activa, aplicar a la especie de la mascota
 * y no tener ya todas sus dosis registradas (el backend rechaza una dosis de más).
 */
export function vaccinationVaccineValidator({ catalog, petSpecies, records }: VaccineContext) {
    return (value: string): string | undefined => {
        if (!value) return "Selecciona la vacuna aplicada.";

        const vaccine = catalog.find((item) => String(item.idVaccine) === value);
        if (!vaccine) return "La vacuna seleccionada no existe en el catálogo.";
        if (!vaccine.status) return "Esta vacuna está inactiva en el catálogo.";
        if (!isVaccineForSpecies(vaccine.species, petSpecies)) {
            return `Esta vacuna no aplica para la especie ${petSpecies}.`;
        }

        const applied = countDoses(records, vaccine.idVaccine);
        if (applied >= vaccine.dosesRequired) {
            return `Esquema completo: ya se aplicaron las ${vaccine.dosesRequired} dosis de ${vaccine.name}.`;
        }

        return undefined;
    };
}

interface DateContext {
    /** Edad de la mascota en años (la fecha no puede ser anterior a su nacimiento estimado). */
    petAgeYears: number;
    /** Fecha de la última dosis de la misma vacuna; la nueva debe ser posterior. */
    previousDoseDate: string | null;
    /** Días hacia atrás permitidos (por defecto VACCINATION_MAX_BACKDATE_DAYS). */
    maxBackdateDays?: number;
}

/**
 * Fecha real, ni futura ni más antigua de lo permitido (por defecto, solo hoy),
 * posterior al nacimiento estimado y a la dosis anterior.
 */
export function vaccinationDateValidator({
    petAgeYears,
    previousDoseDate,
    maxBackdateDays = VACCINATION_MAX_BACKDATE_DAYS,
}: DateContext) {
    return (value: string): string | undefined => {
        if (!value) return "La fecha de aplicación es obligatoria.";

        const date = parseIsoDate(value);
        if (!date) return "Ingresa una fecha válida.";

        const today = startOfToday();
        if (date.getTime() > today.getTime()) return "La fecha de aplicación no puede ser futura.";

        // El backend no valida fechas pasadas, por eso se controla aquí.
        const oldestAllowed = new Date(today.getFullYear(), today.getMonth(), today.getDate() - maxBackdateDays);
        if (date.getTime() < oldestAllowed.getTime()) {
            return maxBackdateDays === 0
                ? "La fecha de aplicación no puede ser anterior a hoy."
                : `La fecha de aplicación no puede ser anterior al ${formatDate(toIsoDate(oldestAllowed))}.`;
        }

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
