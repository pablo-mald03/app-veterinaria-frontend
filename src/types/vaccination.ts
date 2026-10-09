// Estado de la última dosis de una vacuna.
// Lo calcula el FRONTEND con la fecha de próxima dosis (ver lib/vaccination/status.ts).
export type EstadoVacuna = "AL_DIA" | "POR_VENCER" | "VENCIDA";

// ---- Modelos que usa la interfaz (el servicio los arma con los datos crudos del backend) ----

/** Una dosis del carnet, lista para mostrar. */
export interface VaccinationView {
  idVaccination: number;
  idPet: number;
  idVaccine: number;
  /** Nombre tomado del catálogo (el backend solo envía el id). */
  vaccineName: string;
  idDoctor: number;
  doseNumber: number;
  appliedAt: string;
  nextDoseDate: string | null;
  status: EstadoVacuna;
  /** true si ya se aplicaron todas las dosis del esquema (no hay próxima dosis). */
  schemeComplete: boolean;
  lot: string | null;
  notes: string | null;
}

/** Aviso de la campana: una dosis pendiente con los datos de su mascota. */
export interface UpcomingVaccinationView extends VaccinationView {
  /** Cuando no se pudo identificar la mascota: idPet = 0 y petName = "Mascota sin identificar". */
  petName: string;
  ownerName: string | null;
}

/** Lo que captura el formulario (el servicio agrega carnet y veterinario). */
export interface VaccinationInput {
  idVaccine: number;
  appliedAt: string;
  lot?: string;
  notes?: string;
}
