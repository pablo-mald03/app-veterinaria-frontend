import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";

export async function downloadVaccinationCardPdf(petId: number): Promise<Blob> {
    const response = await apiFetch(ENDPOINTS.VACCINATION_CARDS.PDF_BY_PET(petId));
    await ensureOk(response, "No se pudo generar el PDF del carnet de vacunación.");
    return response.blob();
}
