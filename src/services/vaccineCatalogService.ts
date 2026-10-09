import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import type { Page } from "@/types/pagination";
import type { VaccineCatalogInput } from "@/types/vaccines/vaccineCatalog";
import type { VaccineResponse } from "@/types/vaccination-api";

// Administración del CATÁLOGO de vacunas (módulo temporal: ver docs/vaccine-catalog-frontend.md).
// Usa los endpoints que YA EXISTEN en el backend: GET, POST y DELETE /vaccines.
// PUT /vaccines/{id} (editar) no está implementado en el backend (el método del controlador
// devuelve null sin anotación de ruta): por eso aquí no hay edición, solo crear y desactivar.

/** Catálogo completo (hasta 200), ordenado por nombre. */
export async function getVaccineCatalog(): Promise<VaccineResponse[]> {
  const params = new URLSearchParams({
    pageNumber: "0",
    pageSize: "200",
    sortBy: "name",
    direction: "asc",
  });

  const response = await apiFetch(`${ENDPOINTS.VACCINES.LIST}?${params}`);
  await ensureOk(response, "No se pudo cargar el catálogo de vacunas.");

  const data = (await response.json()) as Page<VaccineResponse> | VaccineResponse[];
  return Array.isArray(data) ? data : (data?.content ?? []);
}

/** Crea una vacuna en el catálogo. */
export async function createVaccine(input: VaccineCatalogInput): Promise<void> {
  const response = await apiFetch(ENDPOINTS.VACCINES.LIST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      species: input.species,
      dosesRequired: input.dosesRequired,
      intervalDays: input.intervalDays,
      status: input.status,
    }),
  });

  await ensureOk(response, "No se pudo crear la vacuna.");
}

/** Desactiva una vacuna (borrado lógico; no elimina la fila). */
export async function deactivateVaccine(id: number): Promise<void> {
  const response = await apiFetch(ENDPOINTS.VACCINES.DETAIL(id), { method: "DELETE" });
  await ensureOk(response, "No se pudo desactivar la vacuna.");
}
