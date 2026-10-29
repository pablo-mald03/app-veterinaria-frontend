// Estado de la última aplicación de un tratamiento.
// Lo calcula el FRONTEND con la fecha de próxima aplicación (ver lib/vaccination/status.ts).
export type EstadoVacuna = "AL_DIA" | "POR_VENCER" | "VENCIDA";

// ---- Modelos que usa la interfaz (el servicio los arma con los datos crudos del backend) ----

/** Una aplicación del carnet, lista para mostrar. */
export interface VaccinationView {
  idVaccination: number;
  idPet: number;
  idTreatment: number;
  /** Nombre tomado del catálogo (el backend solo envía el id). */
  treatmentName: string;
  idDoctor: number;
  applicationNumber: number;
  appliedAt: string;
  nextDoseDate: string | null;
  status: EstadoVacuna;
  totalCost: number;
  notes: string | null;
}

/** Aviso de la campana: una aplicación pendiente con los datos de su mascota. */
export interface UpcomingVaccinationView extends VaccinationView {
  /** Cuando no se pudo identificar la mascota: idPet = 0 y petName = "Mascota sin identificar". */
  petName: string;
  ownerName: string | null;
}

/** Lo que captura el formulario (el servicio agrega carnet y veterinario). */
export interface VaccinationInput {
  idTreatment: number;
  appliedAt: string;
  notes?: string;
}
