import { USE_MOCKS } from "@/config/features";
import { notifyVaccinationsChanged } from "@/lib/vaccination/events";
import { VACCINATION_DUE_SOON_DAYS, computeVaccinationStatus } from "@/lib/vaccination/status";
import { vaccinationMock } from "@/services/mocks/vaccinationMock";
import { getPets } from "@/services/petsService";
import type { VaccinationBackend } from "@/services/vaccinationBackend";
import { vaccinationHttp } from "@/services/vaccinationHttp";
import type { UpcomingVaccinationView, VaccinationInput, VaccinationView } from "@/types/vaccination";
import type { TreatmentResponse, VaccinationRecordResponse } from "@/types/vaccination-api";

// Servicio de aplicación de tratamientos a mascotas.
//
// Convierte los datos crudos del backend (carnet, aplicaciones, catálogo) en lo que necesita la
// interfaz. Usa el backend real; los datos simulados solo con NEXT_PUBLIC_USE_MOCKS=true.

const backend: VaccinationBackend = USE_MOCKS ? vaccinationMock : vaccinationHttp;

// Memoria de la identificación de carnets (ver "Avisos" más abajo).
const PET_PAGE_SIZE = 100;
const RESOLVE_CONCURRENCY = 6;
const cardOwners = new Map<number, { idPet: number; petName: string }>();
const petsWithoutCard = new Set<number>();

// ---- Catálogo (se cachea un minuto: lo necesitan el carnet, el formulario y la campana) ----

const CATALOG_TTL_MS = 60_000;
let catalogCache: { at: number; data: TreatmentResponse[] } | null = null;

/** Catálogo de tratamientos (GET /treatments). */
export async function getTreatmentCatalog(): Promise<TreatmentResponse[]> {
  if (catalogCache && Date.now() - catalogCache.at < CATALOG_TTL_MS) return catalogCache.data;

  const data = await backend.getCatalog();
  catalogCache = { at: Date.now(), data };
  return data;
}

/** Para los nombres: si el catálogo falla, el carnet igual se muestra (con "Tratamiento #id"). */
async function getCatalogOrEmpty(): Promise<TreatmentResponse[]> {
  try {
    return await getTreatmentCatalog();
  } catch {
    return [];
  }
}

// ---- Conversión de datos crudos a modelos de la interfaz ----

function toView(record: VaccinationRecordResponse, idPet: number, catalog: TreatmentResponse[]): VaccinationView {
  const treatment = catalog.find((item) => item.idTreatment === record.idTreatment);

  return {
    idVaccination: record.idRecord,
    idPet,
    idTreatment: record.idTreatment,
    treatmentName: treatment?.name ?? `Tratamiento #${record.idTreatment}`,
    idDoctor: record.idDoctor,
    applicationNumber: record.applicationNumber,
    appliedAt: record.applicationDate,
    nextDoseDate: record.nextDoseDate,
    status: computeVaccinationStatus(record.nextDoseDate),
    totalCost: record.totalCost,
    notes: record.notes,
  };
}

// ---- Carnet de una mascota ----

/** Tratamientos aplicados a una mascota. Si todavía no tiene carnet, devuelve una lista vacía. */
export async function getPetVaccinations(petId: number): Promise<VaccinationView[]> {
  const card = await backend.getCardByPet(petId);
  if (!card) return [];

  const [records, catalog] = await Promise.all([backend.getRecordsByCard(card.idCard), getCatalogOrEmpty()]);
  return records.map((record) => toView(record, petId, catalog));
}

/**
 * Registra un tratamiento aplicado. Crea el carnet de la mascota si todavía no existe.
 * El backend calcula el número de aplicación, la próxima fecha y el costo, y descuenta
 * del inventario los productos del tratamiento (si no hay stock suficiente, lo rechaza).
 */
export async function createPetVaccination(petId: number, input: VaccinationInput, doctorId: number): Promise<void> {
  const card = (await backend.getCardByPet(petId)) ?? (await backend.createCard(petId));

  await backend.registerRecord({
    idCard: card.idCard,
    idTreatment: input.idTreatment,
    idDoctor: doctorId,
    applicationDate: input.appliedAt,
    notes: input.notes,
  });

  // La mascota ya tiene carnet: se olvida que "no tenía" para que la campana la tome en cuenta.
  petsWithoutCard.delete(petId);

  // Refresca la campana sin esperar al siguiente refresco automático.
  notifyVaccinationsChanged();
}

// ---- Avisos (campana) ----
//
// GET /vaccination-records/pending devuelve solo { idCard, idTreatment, ... }: no dice a qué
// mascota pertenece cada carnet y no hay un endpoint para averiguarlo. Mientras el backend no
// agregue idPet/petName a esa respuesta, se identifica cada carnet consultando el de las
// mascotas (con memoria para no repetir las llamadas). Si el backend ya envía idPet/petName,
// se usan directamente y no se hace ninguna consulta extra.

async function resolveCardOwners(cardIds: number[]): Promise<void> {
  const missing = new Set(cardIds.filter((id) => !cardOwners.has(id)));
  if (missing.size === 0) return;

  const pets = await getPets(0, PET_PAGE_SIZE)
      .then((page) => page.content)
      .catch(() => []);

  const queue = pets.filter((pet) => !petsWithoutCard.has(pet.idPet));

  const worker = async () => {
    while (missing.size > 0) {
      const pet = queue.shift();
      if (!pet) return;

      try {
        const card = await backend.getCardByPet(pet.idPet);
        if (!card) {
          petsWithoutCard.add(pet.idPet);
          continue;
        }

        cardOwners.set(card.idCard, { idPet: pet.idPet, petName: pet.name });
        missing.delete(card.idCard);
      } catch {
        // una mascota con error no debe impedir identificar al resto
      }
    }
  };

  await Promise.all(Array.from({ length: RESOLVE_CONCURRENCY }, worker));
}

/** Tratamientos vencidos y por vencer en los próximos `days` días (GET /vaccination-records/pending). */
export async function getUpcomingVaccinations(days = VACCINATION_DUE_SOON_DAYS): Promise<UpcomingVaccinationView[]> {
  const pending = await backend.getPending(days);
  if (pending.length === 0) return [];

  const needsLookup = pending.filter((record) => record.idPet === undefined).map((record) => record.idCard);
  const [catalog] = await Promise.all([getCatalogOrEmpty(), resolveCardOwners(needsLookup)]);

  return pending.map((record) => {
    const owner = record.idPet !== undefined
        ? { idPet: record.idPet, petName: record.petName ?? "Mascota" }
        : cardOwners.get(record.idCard);

    return {
      ...toView(record, owner?.idPet ?? 0, catalog),
      petName: owner?.petName ?? "Mascota sin identificar",
      ownerName: null,
    };
  });
}
