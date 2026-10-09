import { addDays } from "@/lib/vaccination/dates";
import type { VaccinationView } from "@/types/vaccination";
import type { VaccineResponse } from "@/types/vaccination-api";

// Funciones puras sobre el carnet de vacunación de una mascota.

type RecordLike = Pick<VaccinationView, "idVaccination" | "idVaccine" | "doseNumber" | "appliedAt">;

/** Ordena de la más reciente a la más antigua (por fecha, luego dosis, luego id). */
function byMostRecent(a: RecordLike, b: RecordLike): number {
    if (a.appliedAt !== b.appliedAt) return a.appliedAt < b.appliedAt ? 1 : -1;
    if (a.doseNumber !== b.doseNumber) return b.doseNumber - a.doseNumber;
    return b.idVaccination - a.idVaccination;
}

/** Carnet ordenado de lo más reciente a lo más antiguo. */
export function sortByAppliedDesc<T extends RecordLike>(records: T[]): T[] {
    return [...records].sort(byMostRecent);
}

/**
 * Última dosis registrada de cada vacuna. Solo esa define si hay que revacunar:
 * las dosis anteriores quedaron "superadas" y no deben generar alertas.
 */
export function latestPerVaccine<T extends RecordLike>(records: T[]): T[] {
    const latest = new Map<number, T>();

    for (const record of sortByAppliedDesc(records)) {
        if (!latest.has(record.idVaccine)) latest.set(record.idVaccine, record);
    }

    return [...latest.values()];
}

export interface VaccinationSummary {
    overdue: number;
    dueSoon: number;
}

/** Cuenta cuántas vacunas (última dosis de cada una) están vencidas o por vencer. */
export function summarizeVaccinations(records: VaccinationView[]): VaccinationSummary {
    const latest = latestPerVaccine(records);

    return {
        overdue: latest.filter((record) => record.status === "VENCIDA").length,
        dueSoon: latest.filter((record) => record.status === "POR_VENCER").length,
    };
}

/** "1 vacuna vencida y 2 por vencer." (null si no hay nada pendiente). */
export function describeSummary({ overdue, dueSoon }: VaccinationSummary): string | null {
    const parts: string[] = [];

    if (overdue > 0) parts.push(`${overdue} ${overdue === 1 ? "vacuna vencida" : "vacunas vencidas"}`);
    if (dueSoon > 0) parts.push(`${dueSoon} por vencer`);

    return parts.length > 0 ? `${parts.join(" y ")}.` : null;
}

// ---- Reglas que replican al backend (RegisterVaccinationRecordHandler / VaccinationRecord) ----
// El backend es quien decide; estas funciones solo adelantan el resultado en el formulario.

/** Cuántas dosis de esa vacuna ya tiene registradas la mascota. */
export function countDoses(records: RecordLike[], idVaccine: number): number {
    return records.filter((record) => record.idVaccine === idVaccine).length;
}

/** Número de dosis que se registrará al guardar (el backend usa: registradas + 1). */
export function nextDoseNumber(records: RecordLike[], idVaccine: number): number {
    return countDoses(records, idVaccine) + 1;
}

/** ¿Ya se aplicaron todas las dosis del esquema? (el backend rechaza una dosis más). */
export function isSchemeComplete(records: RecordLike[], vaccine: Pick<VaccineResponse, "idVaccine" | "dosesRequired">): boolean {
    return countDoses(records, vaccine.idVaccine) >= vaccine.dosesRequired;
}

/**
 * Fecha estimada de la próxima dosis, con la misma regla del backend:
 * solo hay próxima dosis si faltan dosis del esquema y la vacuna tiene intervalo.
 */
export function estimateNextDoseDate(
    vaccine: Pick<VaccineResponse, "dosesRequired" | "intervalDays">,
    doseNumber: number,
    appliedAt: string,
): string | null {
    const hasMoreDoses = doseNumber < vaccine.dosesRequired;
    if (!hasMoreDoses || !vaccine.intervalDays) return null;

    return addDays(appliedAt, vaccine.intervalDays);
}

/** Fecha de la última dosis registrada de esa vacuna (null si no hay ninguna). */
export function findLastDoseDate(records: RecordLike[], idVaccine: number): string | null {
    const dates = records
        .filter((record) => record.idVaccine === idVaccine)
        .map((record) => record.appliedAt)
        .sort();

    return dates.length > 0 ? dates[dates.length - 1] : null;
}
