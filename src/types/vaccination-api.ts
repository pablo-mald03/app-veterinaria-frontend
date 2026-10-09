import type { EstadoVacuna } from "@/types/vaccination";

// Contratos con el backend del módulo de vacunación.
// Todas las fechas viajan como "YYYY-MM-DD" (LocalDate de Java).

// ---- Catálogo de vacunas ----
// YA EXISTE en el backend (GET /vaccines, rama feature/vaccination).
export interface VaccineResponse {
  idVaccine: number;
  name: string;
  description: string;
  /** Texto libre con la(s) especie(s), ej. "PERRO" o "PERRO, GATO". */
  species: string;
  /** Dosis del esquema inicial. */
  dosesRequired: number;
  /** Días entre una dosis y la siguiente. */
  intervalDays: number | null;
  /** true = vacuna activa en el catálogo. */
  status: boolean;
}

// ---- Carnet de vacunación ----
// CONTRATO PROPUESTO (aún no existe en el backend): confirmar nombres y rutas con el equipo.

/** POST /pets/{petId}/vaccinations */
export interface VaccinationRequest {
  idVaccine: number;
  doseNumber: number;
  appliedAt: string;
  lot?: string;
  notes?: string;
}

/** GET /pets/{petId}/vaccinations */
export interface VaccinationResponse {
  idVaccination: number;
  idPet: number;
  idVaccine: number;
  vaccineName: string;
  doseNumber: number;
  appliedAt: string;
  /** Fecha de la próxima dosis, calculada por el backend (aplicación + intervalo). */
  nextDoseDate: string | null;
  status: EstadoVacuna;
  veterinarian: string | null;
  lot: string | null;
  notes: string | null;
}

/** GET /vaccinations/upcoming?days=30 (vencidas y por vencer, para la campana) */
export interface UpcomingVaccinationResponse extends VaccinationResponse {
  petName: string;
  ownerName: string | null;
}
