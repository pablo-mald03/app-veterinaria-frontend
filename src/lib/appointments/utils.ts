import type { BadgeVariant } from "@/components/ui/common/StatusBadgeVariant";
import type { DropdownOption } from "@/components/ui/common/Dropdown";
import type { AppointmentFilterParams, AppointmentResponse } from "@/types/appointment";

//Appointment statuses (values as the backend sends them)
export const STATUS_OPTIONS: DropdownOption[] = [
    { value: "SCHEDULED", label: "Programada" },
    { value: "CONFIRMED", label: "Confirmada" },
    { value: "COMPLETED", label: "Atendida" },
    { value: "CANCELLED", label: "Cancelada" },
];

export const DEFAULT_STATUS = "SCHEDULED";

//Label and color per status; unknown values fall back to the raw text
const STATUS_META: Record<string, { label: string; variant: BadgeVariant }> = {
    SCHEDULED: { label: "Programada", variant: "warning" },
    CONFIRMED: { label: "Confirmada", variant: "info" },
    IN_PROGRESS: { label: "En consulta", variant: "info" },
    COMPLETED: { label: "Atendida", variant: "success" },
    CANCELLED: { label: "Cancelada", variant: "danger" },
    CANCELED: { label: "Cancelada", variant: "danger" },
    NO_SHOW: { label: "No asistió", variant: "gray" },
};

const isCancelled = (status: string) => ["CANCELLED", "CANCELED"].includes(status?.toUpperCase());

export const statusLabel = (status: string) => STATUS_META[status?.toUpperCase()]?.label ?? status;
export const statusVariant = (status: string): BadgeVariant => STATUS_META[status?.toUpperCase()]?.variant ?? "gray";

const pad = (n: number) => String(n).padStart(2, "0");

//Today (yyyy-MM-dd) and current time (HH:mm) in the user's local timezone
export function todayLocal(now = new Date()): string {
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function nowHourLocal(now = new Date()): string {
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

interface ScheduleCheck {
    date: string;
    hour: string;
    petId: string;
    appointments: AppointmentResponse[];
    /** Appointment being edited (excluded from the conflict check) */
    ignoreId?: number;
    /** When true the past check is skipped (editing without moving the appointment) */
    skipPastCheck?: boolean;
}

//Date validation: it cannot be in the past
export function validateDateNotPast(date: string, skip = false): string | undefined {
    if (!skip && date && date < todayLocal()) return "La fecha no puede ser anterior a hoy.";
}

//Hour validation: not in the past (today) and the pet cannot have another appointment at that moment
export function validateSchedule({ date, hour, petId, appointments, ignoreId, skipPastCheck }: ScheduleCheck): string | undefined {
    if (!date || !hour) return undefined;

    if (!skipPastCheck && date === todayLocal() && hour.slice(0, 5) <= nowHourLocal()) {
        return "La hora ya pasó. Elige una hora posterior a la actual.";
    }

    if (petId) {
        const conflict = appointments.some(
            (a) =>
                a.id !== ignoreId &&
                String(a.petId) === petId &&
                a.date === date &&
                a.hour?.slice(0, 5) === hour.slice(0, 5) &&
                !isCancelled(a.status),
        );
        if (conflict) return `Esta mascota ya tiene una cita el ${formatDate(date)} a las ${hour.slice(0, 5)}.`;
    }
}

//yyyy-MM-dd → dd/MM/yyyy (without Date, to avoid timezone shifts)
export function formatDate(date: string): string {
    const [y, m, d] = (date ?? "").split("-");
    return y && m && d ? `${d}/${m}/${y}` : date || "—";
}

//HH:mm:ss → HH:mm
export const formatHour = (hour: string): string => (hour ? hour.slice(0, 5) : "—");

//Most recent appointments first
export function compareByDateDesc(a: AppointmentResponse, b: AppointmentResponse): number {
    return `${b.date}T${b.hour}`.localeCompare(`${a.date}T${a.hour}`);
}

export function matchesFilters(a: AppointmentResponse, f: AppointmentFilterParams): boolean {
    if (f.date && a.date !== f.date) return false;
    if (f.status && a.status?.toUpperCase() !== f.status) return false;
    if (f.petId !== undefined && a.petId !== f.petId) return false;
    if (f.userId !== undefined && a.userId !== f.userId) return false;
    return true;
}

//Veterinarian role: matches the alias or name in Spanish or English (VETERINARIO / VETERINARY)
export const isVeterinarianRole = (role: string) => role?.toUpperCase().includes("VETERINAR");

//Appointments of the given day that are still relevant (cancelled ones are left out), ordered by hour
export function appointmentsOfDay(appointments: AppointmentResponse[], date: string): AppointmentResponse[] {
    return appointments
        .filter((a) => a.date === date && !isCancelled(a.status))
        .sort((a, b) => a.hour.localeCompare(b.hour));
}
