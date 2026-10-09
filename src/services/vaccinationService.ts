import { USE_MOCKS } from "@/config/features";
import { notifyVaccinationsChanged } from "@/lib/vaccination/events";
import { VACCINATION_DUE_SOON_DAYS, computeVaccinationStatus } from "@/lib/vaccination/status";
import { vaccinationMock } from "@/services/mocks/vaccinationMock";
import { getPets } from "@/services/petsService";
import type { VaccinationBackend } from "@/services/vaccinationBackend";
import { vaccinationHttp } from "@/services/vaccinationHttp";
import type { UpcomingVaccinationView, VaccinationInput, VaccinationView } from "@/types/vaccination";
import type { VaccinationRecordResponse, VaccineResponse } from "@/types/vaccination-api";

// Servicio del módulo de vacunación.
//
// Convierte los datos crudos del backend (carnet, dosis, catálogo) en lo que necesita la
// interfaz. Usa el backend real; los datos simulados solo con NEXT_PUBLIC_USE_MOCKS=true.

const backend: VaccinationBackend = USE_MOCKS ? vaccinationMock : vaccinationHttp;

// Memoria de la identificación de carnets (ver "Avisos" más abajo).
const PET_PAGE_SIZE = 100;
const RESOLVE_CONCURRENCY = 6;
const cardOwners = new Map<number, { idPet: number; petName: string }>();
const petsWithoutCard = new Set<number>();

// ---- Catálogo (se cachea un minuto: lo necesitan el carnet, el formulario y la campana) ----

const CATALOG_TTL_MS = 60_000;
let catalogCache: { at: number; data: VaccineResponse[] } | null = null;

/** Catálogo de vacunas (GET /vaccines). */
export async function getVaccineCatalog(): Promise<VaccineResponse[]> {
  if (catalogCache && Date.now() - catalogCache.at < CATALOG_TTL_MS) return catalogCache.data;

  const data = await backend.getCatalog();
  catalogCache = { at: Date.now(), data };
  return data;
}

/** Para los nombres: si el catálogo falla, el carnet igual se muestra (con "Vacuna #id"). */
async function getCatalogOrEmpty(): Promise<VaccineResponse[]> {
  try {
    return await getVaccineCatalog();
  } catch {
    return [];
  }
}

// ---- Conversión de datos crudos a modelos de la interfaz ----

function toView(record: VaccinationRecordResponse, idPet: number, catalog: VaccineResponse[]): VaccinationView {
  const vaccine = catalog.find((item) => item.idVaccine === record.idVaccine);

  return {
    idVaccination: record.idRecord,
    idPet,
    idVaccine: record.idVaccine,
    vaccineName: vaccine?.name ?? `Vacuna #${record.idVaccine}`,
    idDoctor: record.idDoctor,
    doseNumber: record.doseNumber,
    appliedAt: record.applicationDate,
    nextDoseDate: record.nextDoseDate,
    status: computeVaccinationStatus(record.nextDoseDate),
    // Sin próxima dosis y con todas las dosis aplicadas = esquema completo.
    schemeComplete: record.nextDoseDate === null && Boolean(vaccine) && record.doseNumber >= (vaccine?.dosesRequired ?? 0),
    lot: record.batchNumber,
    notes: record.notes,
  };
}

// ---- Carnet de una mascota ----

/** Dosis aplicadas a una mascota. Si todavía no tiene carnet, devuelve una lista vacía. */
export async function getPetVaccinations(petId: number): Promise<VaccinationView[]> {
  const card = await backend.getCardByPet(petId);
  if (!card) return [];

  const [records, catalog] = await Promise.all([backend.getRecordsByCard(card.idCard), getCatalogOrEmpty()]);
  return records.map((record) => toView(record, petId, catalog));
}

/**
 * Registra una vacuna aplicada. Crea el carnet de la mascota si todavía no existe.
 * El backend calcula el número de dosis y la próxima fecha, y rechaza si el esquema está completo.
 */
export async function createPetVaccination(petId: number, input: VaccinationInput, doctorId: number): Promise<void> {
  const card = (await backend.getCardByPet(petId)) ?? (await backend.createCard(petId));

  await backend.registerRecord({
    idCard: card.idCard,
    idVaccine: input.idVaccine,
    idDoctor: doctorId,
    applicationDate: input.appliedAt,
    batchNumber: input.lot,
    notes: input.notes,
  });

  // La mascota ya tiene carnet: se olvida que "no tenía" para que la campana la tome en cuenta.
  petsWithoutCard.delete(petId);

  // Refresca la campana sin esperar al siguiente refresco automático.
  notifyVaccinationsChanged();
}

// ---- Avisos (campana) ----
//
// GET /vaccination-records/pending devuelve solo { idCard, idVaccine, ... }: no dice a qué
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

/** Vacunas vencidas y por vencer en los próximos `days` días (GET /vaccination-records/pending). */
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
