import type {
  VaccinationCardResponse,
  VaccinationRecordRequest,
  VaccinationRecordResponse,
  VaccineResponse,
} from "@/types/vaccination-api";

// Operaciones "crudas" del backend de vacunación (un método por endpoint).
// La implementan: vaccinationHttp.ts (backend real) y mocks/vaccinationMock.ts (datos simulados).
// La lógica de negocio de la interfaz (cruces, estado, nombres) vive en vaccinationService.ts.
export interface VaccinationBackend {
  /** GET /vaccines */
  getCatalog(): Promise<VaccineResponse[]>;
  /** GET {cards}/pet/{idPet} — null si la mascota todavía no tiene carnet (404). */
  getCardByPet(idPet: number): Promise<VaccinationCardResponse | null>;
  /** POST {cards}/pet/{idPet} — crea el carnet o devuelve el existente. */
  createCard(idPet: number): Promise<VaccinationCardResponse>;
  /** GET /vaccination-records/{idCard} */
  getRecordsByCard(idCard: number): Promise<VaccinationRecordResponse[]>;
  /** POST /vaccination-records */
  registerRecord(request: VaccinationRecordRequest): Promise<VaccinationRecordResponse>;
  /** GET /vaccination-records/pending?days=N — vencidas y por vencer (solo la última dosis de cada vacuna). */
  getPending(days: number): Promise<VaccinationRecordResponse[]>;
}
