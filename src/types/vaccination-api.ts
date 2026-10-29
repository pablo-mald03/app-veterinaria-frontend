// Contrato REAL del backend para tratamientos y su aplicación a mascotas.
// Las fechas viajan como "YYYY-MM-DD" (LocalDate de Java).
// Estos son los datos "crudos"; los modelos que usa la interfaz están en types/vaccination.ts.

// ---- Catálogo de tratamientos: GET /treatments ----

/** Producto que consume un tratamiento en cada aplicación. */
export interface TreatmentProduct {
  productId: number;
  quantity: number;
}

export interface TreatmentResponse {
  idTreatment: number;
  name: string;
  description: string;
  /** Días entre una aplicación y la siguiente. Sin intervalo = aplicación única (no hay próxima fecha). */
  intervalDays: number | null;
  /** true = tratamiento activo en el catálogo. */
  status: boolean;
  /** Especies a las que aplica, ej. ["PERRO", "GATO"]. */
  species: string[];
  /** Productos (con su cantidad) que se descuentan del inventario en cada aplicación. */
  products: TreatmentProduct[];
  /** Costo estimado de una aplicación, calculado por el backend a partir de los productos. */
  estimatedCost: number;
}

/** POST /treatments */
export interface TreatmentRequest {
  name: string;
  description: string;
  intervalDays: number | null;
  species: string[];
  products: TreatmentProduct[];
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

// ---- Aplicaciones de tratamientos ----

/** POST /vaccination-records — el backend calcula applicationNumber, nextDoseDate y los lotes/costos. */
export interface VaccinationRecordRequest {
  idCard: number;
  idTreatment: number;
  idDoctor: number;
  applicationDate: string;
  notes?: string;
}

/** Producto descontado del inventario en una aplicación (con el lote del que salió). */
export interface VaccinationRecordItem {
  productId: number;
  batchId: number;
  quantity: number;
  unitCost: number;
}

/** GET /vaccination-records/{idCard} y GET /vaccination-records/pending?days=N */
export interface VaccinationRecordResponse {
  idRecord: number;
  idCard: number;
  idTreatment: number;
  idDoctor: number;
  /** Número de aplicación de ese tratamiento a esa mascota (1, 2, 3...). */
  applicationNumber: number;
  applicationDate: string;
  /** null cuando el tratamiento no tiene intervalo (no se repite). */
  nextDoseDate: string | null;
  totalCost: number;
  notes: string | null;
  items: VaccinationRecordItem[];
  // Campos que hoy el backend NO envía en /pending. Si los agrega, el frontend los usa
  // directamente y deja de consultar cada carnet para averiguar la mascota.
  idPet?: number;
  petName?: string;
}
