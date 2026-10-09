import { addDays, daysFromToday, toIsoDate } from "@/lib/vaccination/dates";
import { latestPerVaccine } from "@/lib/vaccination/records";
import { getPets } from "@/services/petsService";
import type { Page } from "@/types/pagination";
import type { EstadoVacuna } from "@/types/vaccination";
import type {
  UpcomingVaccinationResponse,
  VaccinationRequest,
  VaccinationResponse,
  VaccineResponse,
} from "@/types/vaccination-api";

// DATOS SIMULADOS del módulo de vacunación.
// Solo se usan con NEXT_PUBLIC_USE_MOCKS=true (ver config/features.ts).
// Imitan lo que haría el backend: calculan próxima dosis y estado, y rechazan dosis duplicadas.
// Cuando el backend esté listo NO hay que tocar los componentes: basta con apagar la bandera
// y, al final, borrar este archivo.

const STORAGE_KEY = "happypets.mock.vaccinations";
const LATENCY_MS = 350;
/** Ventana en días para considerar una vacuna "por vencer" (el backend debe definir la suya). */
const DUE_SOON_DAYS = 30;

// ---- Catálogo simulado (misma forma que GET /vaccines) ----

const CATALOG: VaccineResponse[] = [
  { idVaccine: 1, name: "Rabia", description: "Vacuna antirrábica anual", species: "PERRO, GATO", dosesRequired: 1, intervalDays: 365, status: true },
  { idVaccine: 2, name: "Parvovirus", description: "Protección contra parvovirus canino", species: "PERRO", dosesRequired: 3, intervalDays: 21, status: true },
  { idVaccine: 3, name: "Moquillo", description: "Protección contra moquillo canino", species: "PERRO", dosesRequired: 3, intervalDays: 21, status: true },
  { idVaccine: 4, name: "Triple felina", description: "Panleucopenia, rinotraqueítis y calicivirus", species: "GATO", dosesRequired: 3, intervalDays: 21, status: true },
  { idVaccine: 5, name: "Leucemia felina", description: "Protección contra FeLV", species: "GATO", dosesRequired: 2, intervalDays: 21, status: true },
  { idVaccine: 6, name: "Newcastle", description: "Vacuna para aves", species: "AVE", dosesRequired: 2, intervalDays: 30, status: true },
  { idVaccine: 7, name: "Coronavirus canino", description: "Descontinuada en la clínica", species: "PERRO", dosesRequired: 2, intervalDays: 365, status: false },
];

// ---- Almacenamiento (localStorage para que sobreviva a recargas; memoria como respaldo) ----

interface MockStore {
  nextId: number;
  byPet: Record<string, VaccinationResponse[]>;
}

let memoryStore: MockStore = { nextId: 1, byPet: {} };

function readStore(): MockStore {
  if (typeof window === "undefined") return memoryStore;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) memoryStore = JSON.parse(raw) as MockStore;
  } catch {
    // almacenamiento no disponible o corrupto: se sigue con la memoria
  }

  return memoryStore;
}

function writeStore(store: MockStore): void {
  memoryStore = store;
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // sin almacenamiento: queda solo en memoria
  }
}

/** Borra los datos simulados (útil para volver a empezar desde la consola del navegador). */
export function resetVaccinationMock(): void {
  writeStore({ nextId: 1, byPet: {} });
}

// ---- Reglas que en producción calcula el backend ----

function computeStatus(nextDoseDate: string | null): EstadoVacuna {
  if (!nextDoseDate) return "AL_DIA";

  const days = daysFromToday(nextDoseDate);
  if (days === null) return "AL_DIA";
  if (days < 0) return "VENCIDA";
  if (days <= DUE_SOON_DAYS) return "POR_VENCER";
  return "AL_DIA";
}

function buildRecord(
  id: number,
  petId: number,
  vaccine: VaccineResponse,
  doseNumber: number,
  appliedAt: string,
  extra: Partial<Pick<VaccinationResponse, "lot" | "notes" | "veterinarian">> = {},
): VaccinationResponse {
  const nextDoseDate = vaccine.intervalDays ? addDays(appliedAt, vaccine.intervalDays) : null;

  return {
    idVaccination: id,
    idPet: petId,
    idVaccine: vaccine.idVaccine,
    vaccineName: vaccine.name,
    doseNumber,
    appliedAt,
    nextDoseDate,
    status: computeStatus(nextDoseDate),
    veterinarian: extra.veterinarian ?? "Veterinario (demo)",
    lot: extra.lot ?? null,
    notes: extra.notes ?? null,
  };
}

/** El estado depende de la fecha de hoy: se recalcula cada vez que se lee. */
function withFreshStatus(record: VaccinationResponse): VaccinationResponse {
  return { ...record, status: computeStatus(record.nextDoseDate) };
}

function daysAgo(days: number): string {
  return addDays(toIsoDate(new Date()), -days);
}

/**
 * Carnet inicial según el id de la mascota, para poder probar todos los estados:
 *  - id % 3 === 0 -> sin vacunas (estado vacío)
 *  - id % 3 === 1 -> una al día y una vencida
 *  - id % 3 === 2 -> una por vencer y una vencida con dosis anterior superada
 */
function seedFor(petId: number, store: MockStore): VaccinationResponse[] {
  const vaccine = (id: number) => CATALOG.find((item) => item.idVaccine === id)!;
  const next = () => store.nextId++;

  switch (petId % 3) {
    case 1:
      return [
        buildRecord(next(), petId, vaccine(1), 1, daysAgo(100), { lot: "RAB-2026-01" }),
        buildRecord(next(), petId, vaccine(3), 1, daysAgo(40), { lot: "MOQ-0415" }),
      ];
    case 2:
      return [
        buildRecord(next(), petId, vaccine(1), 1, daysAgo(340), { lot: "RAB-2025-11" }),
        buildRecord(next(), petId, vaccine(2), 1, daysAgo(45)),
        buildRecord(next(), petId, vaccine(2), 2, daysAgo(24), { notes: "Sin reacciones adversas." }),
      ];
    default:
      return [];
  }
}

function ensureSeeded(petId: number): VaccinationResponse[] {
  const store = readStore();
  const key = String(petId);

  if (!store.byPet[key]) {
    store.byPet[key] = seedFor(petId, store);
    writeStore(store);
  }

  return store.byPet[key].map(withFreshStatus);
}

function delay(ms = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---- API simulada (mismas firmas que usa vaccinationService) ----

export async function mockGetVaccineCatalog(): Promise<Page<VaccineResponse>> {
  await delay();
  return { content: CATALOG, page: 0, size: CATALOG.length, totalPages: 1, totalElements: CATALOG.length };
}

export async function mockGetPetVaccinations(petId: number): Promise<VaccinationResponse[]> {
  await delay();
  return ensureSeeded(petId);
}

export async function mockCreatePetVaccination(petId: number, request: VaccinationRequest): Promise<VaccinationResponse> {
  await delay();

  const vaccine = CATALOG.find((item) => item.idVaccine === request.idVaccine);
  if (!vaccine) throw new Error("La vacuna indicada no existe en el catálogo.");
  if (!vaccine.status) throw new Error("La vacuna indicada está inactiva.");

  const current = ensureSeeded(petId);
  if (current.some((item) => item.idVaccine === request.idVaccine && item.doseNumber === request.doseNumber)) {
    throw new Error(`La dosis ${request.doseNumber} de ${vaccine.name} ya está registrada para esta mascota.`);
  }

  const store = readStore();
  const record = buildRecord(store.nextId++, petId, vaccine, request.doseNumber, request.appliedAt, {
    lot: request.lot ?? null,
    notes: request.notes ?? null,
  });

  store.byPet[String(petId)] = [...(store.byPet[String(petId)] ?? current), record];
  writeStore(store);

  return record;
}

/** Vencidas y las que vencen dentro de `days` días, de todas las mascotas (para la campana). */
export async function mockGetUpcomingVaccinations(days: number): Promise<UpcomingVaccinationResponse[]> {
  await delay();

  // Los nombres de las mascotas se toman del backend real (GET /pets/all-pets).
  const pets = await getPets(0, 100).then((page) => page.content).catch(() => []);
  const upcoming: UpcomingVaccinationResponse[] = [];

  for (const pet of pets) {
    for (const record of latestPerVaccine(ensureSeeded(pet.idPet))) {
      const remaining = record.nextDoseDate ? daysFromToday(record.nextDoseDate) : null;
      if (remaining === null || remaining > days) continue;

      upcoming.push({ ...record, petName: pet.name, ownerName: null });
    }
  }

  return upcoming.sort((a, b) => (a.nextDoseDate ?? "").localeCompare(b.nextDoseDate ?? ""));
}
