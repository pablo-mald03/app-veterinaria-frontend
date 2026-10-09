import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { JSON_HEADERS } from "@/lib/api/http";
import { ensureOk } from "@/lib/api/ensureOk";
import type {
    AppointmentDiagnosisRequest,
    AppointmentRequest,
    AppointmentResponse,
} from "@/types/appointment";

async function send<T>(url: string, method: string, body: unknown, fallback: string): Promise<T> {
    const response = await apiFetch(url, { method, headers: JSON_HEADERS, body: JSON.stringify(body) });

    await ensureOk(response, fallback);
    return response.json();
}

export const appointmentService = {
    getAll: async (): Promise<AppointmentResponse[]> => {
        const response = await apiFetch(ENDPOINTS.APPOINTMENTS.LIST);

        await ensureOk(response, "Error al listar las citas.");
        return response.json();
    },

    getById: async (id: number): Promise<AppointmentResponse> => {
        const response = await apiFetch(ENDPOINTS.APPOINTMENTS.DETAIL(id));

        await ensureOk(response, "Error al obtener la cita.");
        return response.json();
    },

    getPetHistory: async (petId: number): Promise<AppointmentResponse[]> => {
        const response = await apiFetch(ENDPOINTS.APPOINTMENTS.PET_HISTORY(petId));

        await ensureOk(response, "Error al obtener el historial de la mascota.");
        return response.json();
    },

    create: (data: AppointmentRequest) =>
        send<AppointmentResponse>(ENDPOINTS.APPOINTMENTS.CREATE, "POST", data, "Error al agendar la cita."),

    update: (id: number, data: AppointmentRequest) =>
        send<AppointmentResponse>(ENDPOINTS.APPOINTMENTS.UPDATE(id), "PUT", data, "Error al actualizar la cita."),

    updateDiagnosis: (id: number, data: AppointmentDiagnosisRequest) =>
        send<AppointmentResponse>(ENDPOINTS.APPOINTMENTS.DIAGNOSIS(id), "PATCH", data, "Error al guardar el diagnóstico."),

    updateStatus: (id: number, status: string) =>
        send<AppointmentResponse>(ENDPOINTS.APPOINTMENTS.STATUS(id), "PATCH", { status }, "Error al actualizar el estado de la cita."),

    delete: async (id: number): Promise<void> => {
        const response = await apiFetch(ENDPOINTS.APPOINTMENTS.DELETE(id), { method: "DELETE" });

        if (response.status >= 500) {
            throw new Error("No se pudo eliminar la cita. Si ya fue atendida o tiene historial médico registrado no puede eliminarse; en ese caso cámbiala a Cancelada.");
        }

        await ensureOk(response, "Error al eliminar la cita.");
    },
};
