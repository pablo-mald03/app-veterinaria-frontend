import type {
  AppointmentRequest,
  AppointmentResponse,
  MedicalConsultationRequest,
} from "@/types/consultation-api";

// Operaciones "crudas" del backend de citas, en la parte que necesita el historial clínico.
// La implementan: consultationHttp.ts (backend real) y mocks/consultationMock.ts (datos simulados).
export interface ConsultationBackend {
  /** GET /appointments/pet/{petId}/history — solo citas COMPLETED, más reciente primero. */
  getHistoryByPet(petId: number): Promise<AppointmentResponse[]>;
  /** POST /appointments — crea la cita que se va a completar de inmediato. */
  createAppointment(request: AppointmentRequest): Promise<AppointmentResponse>;
  /** PATCH /appointments/{id}/diagnosis — registra diagnóstico, tratamiento y costo; pasa a COMPLETED. */
  completeAppointment(id: number, request: MedicalConsultationRequest): Promise<AppointmentResponse>;
}
