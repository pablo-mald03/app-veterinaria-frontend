import { daysFromToday } from "@/lib/vaccination/dates";
import type { EstadoVacuna } from "@/types/vaccination";

// Estado de una vacuna a partir de su fecha de próxima dosis.
// Es una regla de la interfaz: el backend solo entrega la fecha.

/** Días de anticipación para considerar una vacuna "por vencer" (y para consultar las pendientes). */
export const VACCINATION_DUE_SOON_DAYS = 30;

export function computeVaccinationStatus(nextDoseDate: string | null, now: Date = new Date()): EstadoVacuna {
    if (!nextDoseDate) return "AL_DIA";

    const days = daysFromToday(nextDoseDate, now);
    if (days === null) return "AL_DIA";
    if (days < 0) return "VENCIDA";
    if (days <= VACCINATION_DUE_SOON_DAYS) return "POR_VENCER";
    return "AL_DIA";
}
