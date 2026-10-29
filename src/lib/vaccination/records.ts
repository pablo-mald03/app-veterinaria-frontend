import { addDays } from "@/lib/vaccination/dates";
import type { VaccinationView } from "@/types/vaccination";
import type { TreatmentResponse } from "@/types/vaccination-api";

// Funciones puras sobre el carnet de tratamientos de una mascota.

type RecordLike = Pick<VaccinationView, "idVaccination" | "idTreatment" | "applicationNumber" | "appliedAt">;

/** Ordena de la más reciente a la más antigua (por fecha, luego número de aplicación, luego id). */
function byMostRecent(a: RecordLike, b: RecordLike): number {
    if (a.appliedAt !== b.appliedAt) return a.appliedAt < b.appliedAt ? 1 : -1;
    if (a.applicationNumber !== b.applicationNumber) return b.applicationNumber - a.applicationNumber;
    return b.idVaccination - a.idVaccination;
}

/** Carnet ordenado de lo más reciente a lo más antiguo. */
export function sortByAppliedDesc<T extends RecordLike>(records: T[]): T[] {
    return [...records].sort(byMostRecent);
}

/**
 * Última aplicación registrada de cada tratamiento. Solo esa define si hay que repetirlo:
 * las anteriores quedaron "superadas" y no deben generar alertas.
 */
export function latestPerTreatment<T extends RecordLike>(records: T[]): T[] {
    const latest = new Map<number, T>();

    for (const record of sortByAppliedDesc(records)) {
        if (!latest.has(record.idTreatment)) latest.set(record.idTreatment, record);
    }

    return [...latest.values()];
}

export interface VaccinationSummary {
    overdue: number;
    dueSoon: number;
}

/** Cuenta cuántos tratamientos (última aplicación de cada uno) están vencidos o por vencer. */
export function summarizeVaccinations(records: VaccinationView[]): VaccinationSummary {
    const latest = latestPerTreatment(records);

    return {
        overdue: latest.filter((record) => record.status === "VENCIDA").length,
        dueSoon: latest.filter((record) => record.status === "POR_VENCER").length,
    };
}

/** "1 tratamiento vencido y 2 por vencer." (null si no hay nada pendiente). */
export function describeSummary({ overdue, dueSoon }: VaccinationSummary): string | null {
    const parts: string[] = [];

    if (overdue > 0) parts.push(`${overdue} ${overdue === 1 ? "tratamiento vencido" : "tratamientos vencidos"}`);
    if (dueSoon > 0) parts.push(`${dueSoon} por vencer`);

    return parts.length > 0 ? `${parts.join(" y ")}.` : null;
}

// ---- Reglas que replican al backend ----
// El backend es quien decide; estas funciones solo adelantan el resultado en el formulario.

/** Cuántas veces se le aplicó ya ese tratamiento a la mascota. */
export function countApplications(records: RecordLike[], idTreatment: number): number {
    return records.filter((record) => record.idTreatment === idTreatment).length;
}

/** Número de aplicación que se registrará al guardar (el backend usa: registradas + 1). */
export function nextApplicationNumber(records: RecordLike[], idTreatment: number): number {
    return countApplications(records, idTreatment) + 1;
}

/**
 * Fecha estimada de la próxima aplicación: solo existe si el tratamiento tiene intervalo.
 * Un tratamiento sin intervalo es de aplicación única.
 */
export function estimateNextDoseDate(treatment: Pick<TreatmentResponse, "intervalDays">, appliedAt: string): string | null {
    if (!treatment.intervalDays) return null;

    return addDays(appliedAt, treatment.intervalDays);
}

/** Fecha de la última aplicación registrada de ese tratamiento (null si no hay ninguna). */
export function findLastApplicationDate(records: RecordLike[], idTreatment: number): string | null {
    const dates = records
        .filter((record) => record.idTreatment === idTreatment)
        .map((record) => record.appliedAt)
        .sort();

    return dates.length > 0 ? dates[dates.length - 1] : null;
}
