import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import { buildQuery } from "@/lib/api/http";
import type { AttendedPetReport, FrequentTreatmentReport, PendingVaccineReport } from "@/types/report";

async function getJson<T>(url: string, fallback: string): Promise<T> {
    const response = await apiFetch(url);
    await ensureOk(response, fallback);
    return response.json();
}

async function getPdf(url: string, fallback: string): Promise<Blob> {
    const response = await apiFetch(url);
    await ensureOk(response, fallback);
    return response.blob();
}

export const reportService = {
    attendedPets: (from: string, to: string) =>
        getJson<AttendedPetReport[]>(
            `${ENDPOINTS.REPORTS.ATTENDED_PETS}?${buildQuery({ from, to })}`,
            "Error al consultar las mascotas atendidas.",
        ),

    frequentTreatments: (from: string, to: string) =>
        getJson<FrequentTreatmentReport[]>(
            `${ENDPOINTS.REPORTS.FREQUENT_TREATMENTS}?${buildQuery({ from, to })}`,
            "Error al consultar los tratamientos frecuentes.",
        ),

    pendingVaccines: (days: number) =>
        getJson<PendingVaccineReport[]>(
            `${ENDPOINTS.REPORTS.PENDING_VACCINES}?${buildQuery({ days })}`,
            "Error al consultar los tratamientos pendientes.",
        ),

    downloadAttendedPetsPdf: (from: string, to: string) =>
        getPdf(
            `${ENDPOINTS.REPORTS.ATTENDED_PETS}?${buildQuery({ from, to, format: "pdf" })}`,
            "Error al generar el reporte de mascotas atendidas.",
        ),

    downloadFrequentTreatmentsPdf: (from: string, to: string) =>
        getPdf(
            `${ENDPOINTS.REPORTS.FREQUENT_TREATMENTS}?${buildQuery({ from, to, format: "pdf" })}`,
            "Error al generar el reporte de tratamientos frecuentes.",
        ),

    downloadPendingVaccinesPdf: (days: number) =>
        getPdf(
            `${ENDPOINTS.REPORTS.PENDING_VACCINES}?${buildQuery({ days, format: "pdf" })}`,
            "Error al generar el reporte de vacunas pendientes.",
        ),
};
