import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import type { VaccinationBackend } from "@/services/vaccinationBackend";
import type { Page } from "@/types/pagination";
import type {
  VaccinationCardResponse,
  VaccinationRecordRequest,
  VaccinationRecordResponse,
  VaccineResponse,
} from "@/types/vaccination-api";

// Backend REAL de vacunación (llamadas HTTP). Ver los contratos en types/vaccination-api.ts.

/** Acepta tanto un arreglo simple como una respuesta paginada ({ content: [...] }). */
function toList<T>(data: T[] | Page<T> | null | undefined): T[] {
  if (Array.isArray(data)) return data;
  return data?.content ?? [];
}

export const vaccinationHttp: VaccinationBackend = {
  async getCatalog() {
    // sortBy explícito: el backend usa "id" por defecto y la entidad se llama "idVaccine".
    const params = new URLSearchParams({
      pageNumber: "0",
      pageSize: "100",
      sortBy: "name",
      direction: "asc",
    });

    const response = await apiFetch(`${ENDPOINTS.VACCINES.LIST}?${params}`);
    await ensureOk(response, "No se pudo cargar el catálogo de vacunas.");

    return toList<VaccineResponse>(await response.json());
  },

  async getCardByPet(idPet) {
    const response = await apiFetch(ENDPOINTS.VACCINATION_CARDS.BY_PET(idPet));

    // 404 = la mascota todavía no tiene carnet (caso normal, no es un error).
    if (response.status === 404) return null;

    await ensureOk(response, "No se pudo cargar el carnet de la mascota.");
    return (await response.json()) as VaccinationCardResponse;
  },

  async createCard(idPet) {
    const response = await apiFetch(ENDPOINTS.VACCINATION_CARDS.BY_PET(idPet), { method: "POST" });

    await ensureOk(response, "No se pudo crear el carnet de vacunación.");
    return (await response.json()) as VaccinationCardResponse;
  },

  async getRecordsByCard(idCard) {
    const response = await apiFetch(ENDPOINTS.VACCINATION_RECORDS.BY_CARD(idCard));

    await ensureOk(response, "No se pudo cargar el carnet de vacunación.");
    return toList<VaccinationRecordResponse>(await response.json());
  },

  async registerRecord(request: VaccinationRecordRequest) {
    const response = await apiFetch(ENDPOINTS.VACCINATION_RECORDS.BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    await ensureOk(response, "No se pudo registrar la vacuna.");
    return (await response.json()) as VaccinationRecordResponse;
  },

  async getPending(days) {
    const response = await apiFetch(ENDPOINTS.VACCINATION_RECORDS.PENDING(days));

    await ensureOk(response, "No se pudieron cargar las vacunas por vencer.");
    return toList<VaccinationRecordResponse>(await response.json());
  },
};
