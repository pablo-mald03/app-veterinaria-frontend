import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import type { Page } from "@/types/pagination";
import type { TreatmentCatalogInput } from "@/types/vaccines/vaccineCatalog";
import type { TreatmentRequest, TreatmentResponse } from "@/types/vaccination-api";

// Administración del CATÁLOGO de tratamientos y los productos que consumen.
// Usa los endpoints del backend: GET /treatments, POST /treatments y DELETE /treatments/{id}.
// El contrato no incluye edición (PUT): por eso aquí solo se puede crear y desactivar.

/** Catálogo completo, ordenado por nombre (GET /treatments no recibe parámetros ni pagina). */
export async function getTreatmentCatalog(): Promise<TreatmentResponse[]> {
  const response = await apiFetch(ENDPOINTS.TREATMENTS.LIST);
  await ensureOk(response, "No se pudo cargar el catálogo de tratamientos.");

  const data = (await response.json()) as Page<TreatmentResponse> | TreatmentResponse[];
  const list = Array.isArray(data) ? data : (data?.content ?? []);

  return [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/** Crea un tratamiento en el catálogo (queda activo; el backend calcula su costo estimado). */
export async function createTreatment(input: TreatmentCatalogInput): Promise<void> {
  const body: TreatmentRequest = {
    name: input.name,
    description: input.description,
    intervalDays: input.intervalDays,
    species: input.species,
    products: input.products,
  };

  const response = await apiFetch(ENDPOINTS.TREATMENTS.LIST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  await ensureOk(response, "No se pudo crear el tratamiento.");
}

/** Desactiva un tratamiento (borrado lógico; no elimina el historial ya registrado). */
export async function deactivateTreatment(id: number): Promise<void> {
  const response = await apiFetch(ENDPOINTS.TREATMENTS.DETAIL(id), { method: "DELETE" });
  await ensureOk(response, "No se pudo desactivar el tratamiento.");
}
