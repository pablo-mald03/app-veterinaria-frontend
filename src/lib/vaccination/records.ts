import type { VaccinationResponse } from "@/types/vaccination-api";

// Funciones puras sobre el carnet de vacunación de una mascota.

type RecordLike = Pick<VaccinationResponse, "idVaccination" | "idVaccine" | "doseNumber" | "appliedAt">;

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
export function summarizeVaccinations(records: VaccinationResponse[]): VaccinationSummary {
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

/** Dosis ya registradas de una vacuna. */
export function takenDosesOf(records: RecordLike[], idVaccine: number): number[] {
    return records.filter((record) => record.idVaccine === idVaccine).map((record) => record.doseNumber);
}

/** Siguiente número de dosis sugerido (última registrada + 1; 1 si no hay ninguna). */
export function suggestNextDose(records: RecordLike[], idVaccine: number): number {
    const taken = takenDosesOf(records, idVaccine);
    return taken.length > 0 ? Math.max(...taken) + 1 : 1;
}

/** Fecha de la dosis inmediatamente anterior a `doseNumber` de esa vacuna (null si no existe). */
export function findPreviousDoseDate(records: RecordLike[], idVaccine: number, doseNumber: number): string | null {
    const previous = records
        .filter((record) => record.idVaccine === idVaccine && record.doseNumber < doseNumber)
        .sort((a, b) => b.doseNumber - a.doseNumber)[0];

    return previous?.appliedAt ?? null;
}

/**
 * Aviso NO bloqueante sobre el número de dosis (el registro igual se permite):
 * - se saltó una dosis anterior
 * - supera el esquema inicial (se considera refuerzo)
 */
export function getDoseWarning(
    doseNumber: number,
    dosesRequired: number,
    takenDoses: number[],
): string | undefined {
    if (doseNumber > 1 && !takenDoses.includes(doseNumber - 1)) {
        return `Aún no hay registrada la dosis ${doseNumber - 1} de esta vacuna.`;
    }

    if (dosesRequired > 0 && doseNumber > dosesRequired) {
        return `Supera el esquema inicial de ${dosesRequired} dosis; se registrará como refuerzo.`;
    }

    return undefined;
}
