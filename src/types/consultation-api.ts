// Contrato con el backend de citas (módulo "appointment", rama feature/module-appointments;
// todavía no está en develop). Se reutiliza /appointments: una consulta clínica es una cita
// con estado COMPLETED, diagnóstico, tratamiento y costo ya registrados.
// Las fechas viajan como "YYYY-MM-DD" y la hora como "HH:mm:ss" (LocalDate/LocalTime de Java).

export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

/** GET /appointments, /appointments/{id}, /appointments/pet/{petId}/history */
export interface AppointmentResponse {
  id: number;
  petId: number;
  userId: number;
  roomId: number | null;
  date: string;
  hour: string;
  description: string;
  diagnosis: string | null;
  treatment: string | null;
  cost: number | null;
  status: AppointmentStatus;
}

/** POST /appointments, PUT /appointments/{id} */
export interface AppointmentRequest {
  petId: number;
  userId: number;
  roomId?: number;
  date: string;
  hour: string;
  description: string;
  diagnosis?: string;
}

/** PATCH /appointments/{id}/diagnosis — registra la consulta (diagnóstico + tratamiento + costo) y pasa la cita a COMPLETED. */
export interface MedicalConsultationRequest {
  diagnosis: string;
  treatment: string;
  cost: number;
}
