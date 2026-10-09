import { USE_MOCKS } from "@/config/features";
import { consultationMock } from "@/services/mocks/consultationMock";
import type { ConsultationBackend } from "@/services/consultationBackend";
import { consultationHttp } from "@/services/consultationHttp";
import type { ConsultationInput, ConsultationView } from "@/types/consultation";
import type { AppointmentResponse } from "@/types/consultation-api";

// Servicio del historial de consultas.
//
// Reutiliza el módulo de citas del backend: una consulta clínica es una cita en estado
// COMPLETED. Registrar una consulta ya realizada = crear la cita y completarla de inmediato
// con diagnóstico, tratamiento y costo (el flujo normal de agendar-y-atender no aplica aquí).
// Usa el backend real; los datos simulados solo con NEXT_PUBLIC_USE_MOCKS=true.

const backend: ConsultationBackend = USE_MOCKS ? consultationMock : consultationHttp;

function toView(appointment: AppointmentResponse): ConsultationView {
  return {
    idAppointment: appointment.id,
    idPet: appointment.petId,
    date: appointment.date,
    hour: appointment.hour,
    reason: appointment.description,
    diagnosis: appointment.diagnosis ?? "",
    treatment: appointment.treatment ?? "",
    cost: appointment.cost ?? 0,
  };
}

/** Historial de consultas completadas de una mascota, de la más reciente a la más antigua. */
export async function getConsultationHistory(petId: number): Promise<ConsultationView[]> {
  const history = await backend.getHistoryByPet(petId);
  return history.filter((item) => item.status === "COMPLETED").map(toView);
}

/**
 * Registra una consulta ya realizada: crea la cita (con la fecha y hora actuales, atendida
 * por el veterinario con sesión) y la completa de inmediato con diagnóstico, tratamiento y costo.
 */
export async function createConsultation(petId: number, input: ConsultationInput, doctorId: number): Promise<void> {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const hour = `${pad(today.getHours())}:${pad(today.getMinutes())}:00`;

  const appointment = await backend.createAppointment({
    petId,
    userId: doctorId,
    date,
    hour,
    description: input.reason,
  });

  await backend.completeAppointment(appointment.id, {
    diagnosis: input.diagnosis,
    treatment: input.treatment,
    cost: input.cost,
  });
}
