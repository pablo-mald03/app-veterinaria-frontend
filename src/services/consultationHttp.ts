import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import type { ConsultationBackend } from "@/services/consultationBackend";
import type {
  AppointmentRequest,
  AppointmentResponse,
  MedicalConsultationRequest,
} from "@/types/consultation-api";

// Backend REAL de citas/consultas (llamadas HTTP). Ver el contrato en types/consultation-api.ts.

export const consultationHttp: ConsultationBackend = {
  async getHistoryByPet(petId) {
    const response = await apiFetch(ENDPOINTS.APPOINTMENTS.HISTORY_BY_PET(petId));

    // El backend responde 204 cuando la mascota no tiene consultas completadas.
    if (response.status === 204) return [];

    await ensureOk(response, "No se pudo cargar el historial de consultas.");
    return (await response.json()) as AppointmentResponse[];
  },

  async createAppointment(request: AppointmentRequest) {
    const response = await apiFetch(ENDPOINTS.APPOINTMENTS.BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    await ensureOk(response, "No se pudo registrar la cita.");
    return (await response.json()) as AppointmentResponse;
  },

  async completeAppointment(id, request: MedicalConsultationRequest) {
    const response = await apiFetch(ENDPOINTS.APPOINTMENTS.UPDATE_DIAGNOSIS(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    await ensureOk(response, "No se pudo registrar el diagnóstico de la consulta.");
    return (await response.json()) as AppointmentResponse;
  },
};
