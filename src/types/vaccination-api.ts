// Contrato REAL del backend para vacunación (rama develop).
// Las fechas viajan como "YYYY-MM-DD" (LocalDate de Java).
// Estos son los datos "crudos"; los modelos que usa la interfaz están en types/vaccination.ts.

// ---- Catálogo de vacunas: GET /vaccines ----
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

// ---- Carnet (1 por mascota) ----
// GET  {cards}/pet/{idPet}  -> 404 si la mascota aún no tiene carnet
// POST {cards}/pet/{idPet}  -> lo crea, o devuelve el existente
export interface VaccinationCardResponse {
  idCard: number;
  idPet: number;
  creationDate: string;
  status: boolean;
}

// ---- Dosis aplicadas ----

/** POST /vaccination-records — el backend calcula doseNumber y nextDoseDate. */
export interface VaccinationRecordRequest {
  idCard: number;
  idVaccine: number;
  idDoctor: number;
  applicationDate: string;
  batchNumber?: string;
  notes?: string;
}

/** GET /vaccination-records/{idCard} y GET /vaccination-records/pending?days=N */
export interface VaccinationRecordResponse {
  idRecord: number;
  idCard: number;
  idVaccine: number;
  idDoctor: number;
  doseNumber: number;
  applicationDate: string;
  /** null cuando ya se aplicó la última dosis del esquema. */
  nextDoseDate: string | null;
  batchNumber: string | null;
  notes: string | null;
  // Campos que hoy el backend NO envía en /pending. Si los agrega, el frontend los usa
  // directamente y deja de consultar cada carnet para averiguar la mascota.
  idPet?: number;
  petName?: string;
}
