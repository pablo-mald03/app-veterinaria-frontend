// Utilidades de fechas ISO ("YYYY-MM-DD") en hora LOCAL.
// Se evita `new Date("YYYY-MM-DD")` porque lo interpreta en UTC y en Guatemala
// mostraría el día anterior.

const MS_PER_DAY = 86_400_000;

function pad(value: number): string {
    return String(value).padStart(2, "0");
}

/** Date -> "YYYY-MM-DD" (hora local). */
export function toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DD" -> Date local. Devuelve null si el formato o la fecha no existen (ej. 2026-02-31). */
export function parseIsoDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;

    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return toIsoDate(date) === value ? date : null;
}

/** Hoy a las 00:00 (hora local). */
export function startOfToday(now: Date = new Date()): Date {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Suma (o resta) días a una fecha ISO. Si la fecha es inválida la devuelve igual. */
export function addDays(iso: string, days: number): string {
    const date = parseIsoDate(iso);
    if (!date) return iso;

    date.setDate(date.getDate() + days);
    return toIsoDate(date);
}

/** Resta años a una fecha. */
export function subtractYears(date: Date, years: number): Date {
    return new Date(date.getFullYear() - years, date.getMonth(), date.getDate());
}

/** Días que faltan desde hoy hasta la fecha (negativo si ya pasó). null si la fecha es inválida. */
export function daysFromToday(iso: string, now: Date = new Date()): number | null {
    const date = parseIsoDate(iso.slice(0, 10));
    if (!date) return null;

    return Math.round((date.getTime() - startOfToday(now).getTime()) / MS_PER_DAY);
}

/** "2026-10-08" -> "08/10/2026". Devuelve "—" si no hay fecha. */
export function formatDate(iso: string | null | undefined): string {
    if (!iso) return "—";

    const date = parseIsoDate(iso.slice(0, 10));
    if (!date) return "—";

    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** Texto legible de la distancia a la próxima dosis. */
export function describeDue(days: number | null): string {
    if (days === null) return "Sin fecha de próxima dosis";
    if (days === 0) return "Vence hoy";
    if (days === 1) return "Vence mañana";
    if (days > 1) return `Vence en ${days} días`;
    if (days === -1) return "Venció ayer";
    return `Venció hace ${Math.abs(days)} días`;
}
