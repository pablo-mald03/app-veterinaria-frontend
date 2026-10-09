import { ENDPOINTS } from "@/config/api";
import { USE_MOCKS } from "@/config/features";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import { notifyVaccinationsChanged } from "@/lib/vaccination/events";
import {
  mockCreatePetVaccination,
  mockGetPetVaccinations,
  mockGetUpcomingVaccinations,
  mockGetVaccineCatalog,
} from "@/services/mocks/vaccinationMock";
import type { Page } from "@/types/pagination";
import type {
  UpcomingVaccinationResponse,
  VaccinationRequest,
  VaccinationResponse,
  VaccineResponse,
} from "@/types/vaccination-api";

// Servicio del módulo de vacunación.
//
// Es el ÚNICO punto que decide entre datos reales y simulados (USE_MOCKS), de modo que los
// componentes y hooks no saben cuál se usa. Para conectar el backend real no hay que
// modificarlos: solo apagar NEXT_PUBLIC_USE_MOCKS y ajustar este archivo si el contrato cambia.

/** Acepta tanto un arreglo simple como una respuesta paginada ({ content: [...] }). */
function toList<T>(data: T[] | Page<T> | null | undefined): T[] {
  if (Array.isArray(data)) return data;
  return data?.content ?? [];
}

/** Catálogo de vacunas (GET /vaccines — ya existe en el backend). */
export async function getVaccineCatalog(): Promise<VaccineResponse[]> {
  if (USE_MOCKS) return (await mockGetVaccineCatalog()).content;

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
}

/** Carnet de vacunación de una mascota (GET /pets/{petId}/vaccinations — propuesto). */
export async function getPetVaccinations(petId: number): Promise<VaccinationResponse[]> {
  if (USE_MOCKS) return mockGetPetVaccinations(petId);

  const response = await apiFetch(ENDPOINTS.VACCINATIONS.BY_PET(petId));
  await ensureOk(response, "No se pudo cargar el carnet de vacunación.");

  return toList<VaccinationResponse>(await response.json());
}

/** Registra una vacuna aplicada (POST /pets/{petId}/vaccinations — propuesto). */
export async function createPetVaccination(petId: number, request: VaccinationRequest): Promise<void> {
  if (USE_MOCKS) {
    await mockCreatePetVaccination(petId, request);
  } else {
    const response = await apiFetch(ENDPOINTS.VACCINATIONS.BY_PET(petId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    await ensureOk(response, "No se pudo registrar la vacuna.");
  }

  // Refresca la campana sin esperar al siguiente refresco automático.
  notifyVaccinationsChanged();
}

/** Vacunas vencidas y por vencer en los próximos `days` días (GET /vaccinations/upcoming — propuesto). */
export async function getUpcomingVaccinations(days = 30): Promise<UpcomingVaccinationResponse[]> {
  if (USE_MOCKS) return mockGetUpcomingVaccinations(days);

  const response = await apiFetch(ENDPOINTS.VACCINATIONS.UPCOMING(days));
  await ensureOk(response, "No se pudieron cargar las vacunas por vencer.");

  return toList<UpcomingVaccinationResponse>(await response.json());
}
