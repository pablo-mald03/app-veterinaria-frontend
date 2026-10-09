import { addDays, daysFromToday, toIsoDate } from "@/lib/vaccination/dates";
import { getPets } from "@/services/petsService";
import type { VaccinationBackend } from "@/services/vaccinationBackend";
import type {
  VaccinationCardResponse,
  VaccinationRecordResponse,
  VaccineResponse,
} from "@/types/vaccination-api";

// BACKEND SIMULADO de vacunación (solo desarrollo, con NEXT_PUBLIC_USE_MOCKS=true).
// Implementa el MISMO contrato que el backend real y replica sus reglas:
//  - la dosis la calcula el servidor (registradas + 1) y se rechaza si supera el esquema
//  - la próxima dosis solo existe si faltan dosis del esquema
//  - /pending devuelve la última dosis de cada vacuna con próxima dosis <= hoy + días
//  - el carnet de una mascota no existe hasta que se crea
// Es opcional: sirve para trabajar sin backend. Se puede borrar cuando ya no haga falta.

const STORAGE_KEY = "happypets.mock.vaccination.v2";
const LATENCY_MS = 300;

const CATALOG: VaccineResponse[] = [
  { idVaccine: 1, name: "Rabia", description: "Vacuna antirrábica", species: "PERRO, GATO", dosesRequired: 2, intervalDays: 365, status: true },
  { idVaccine: 2, name: "Parvovirus", description: "Protección contra parvovirus canino", species: "PERRO", dosesRequired: 3, intervalDays: 21, status: true },
  { idVaccine: 3, name: "Moquillo", description: "Protección contra moquillo canino", species: "PERRO", dosesRequired: 3, intervalDays: 21, status: true },
  { idVaccine: 4, name: "Triple felina", description: "Panleucopenia, rinotraqueítis y calicivirus", species: "GATO", dosesRequired: 3, intervalDays: 21, status: true },
  { idVaccine: 5, name: "Leucemia felina", description: "Protección contra FeLV", species: "GATO", dosesRequired: 2, intervalDays: 21, status: true },
  { idVaccine: 6, name: "Newcastle", description: "Vacuna para aves", species: "AVE", dosesRequired: 2, intervalDays: 30, status: true },
  { idVaccine: 7, name: "Coronavirus canino", description: "Descontinuada en la clínica", species: "PERRO", dosesRequired: 2, intervalDays: 365, status: false },
];

interface MockStore {
  nextCardId: number;
  nextRecordId: number;
  /** Mascotas cuyo escenario inicial ya se generó. */
  seeded: number[];
  cards: VaccinationCardResponse[];
  records: VaccinationRecordResponse[];
}

const EMPTY_STORE: MockStore = { nextCardId: 1, nextRecordId: 1, seeded: [], cards: [], records: [] };
let memoryStore: MockStore = structuredClone(EMPTY_STORE);

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
  writeStore(structuredClone(EMPTY_STORE));
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function daysAgo(days: number): string {
  return addDays(toIsoDate(new Date()), -days);
}

// ---- Reglas del backend ----

function nextDoseDateFor(vaccine: VaccineResponse, doseNumber: number, appliedAt: string): string | null {
  const hasMoreDoses = doseNumber < vaccine.dosesRequired;
  return hasMoreDoses && vaccine.intervalDays ? addDays(appliedAt, vaccine.intervalDays) : null;
}

function addRecord(
  store: MockStore,
  idCard: number,
  vaccine: VaccineResponse,
  appliedAt: string,
  extra: { batchNumber?: string; notes?: string; idDoctor?: number } = {},
): VaccinationRecordResponse {
  const doseNumber = store.records.filter((r) => r.idCard === idCard && r.idVaccine === vaccine.idVaccine).length + 1;

  const record: VaccinationRecordResponse = {
    idRecord: store.nextRecordId++,
    idCard,
    idVaccine: vaccine.idVaccine,
    idDoctor: extra.idDoctor ?? 1,
    doseNumber,
    applicationDate: appliedAt,
    nextDoseDate: nextDoseDateFor(vaccine, doseNumber, appliedAt),
    batchNumber: extra.batchNumber ?? null,
    notes: extra.notes ?? null,
  };

  store.records.push(record);
  return record;
}

function createCardIn(store: MockStore, idPet: number): VaccinationCardResponse {
  const existing = store.cards.find((c) => c.idPet === idPet);
  if (existing) return existing;

  const card: VaccinationCardResponse = {
    idCard: store.nextCardId++,
    idPet,
    creationDate: toIsoDate(new Date()),
    status: true,
  };

  store.cards.push(card);
  return card;
}

/**
 * Escenario inicial según el id de la mascota, para poder probar todos los estados:
 *  - id % 3 === 0 -> sin carnet (aún no se creó)
 *  - id % 3 === 1 -> una al día y una vencida
 *  - id % 3 === 2 -> una por vencer, una vencida con dosis anterior superada y una con esquema completo
 */
function seedPet(store: MockStore, idPet: number): void {
  if (store.seeded.includes(idPet)) return;
  store.seeded.push(idPet);

  const vaccine = (id: number) => CATALOG.find((v) => v.idVaccine === id)!;
  const scenario = idPet % 3;
  if (scenario === 0) return;

  const card = createCardIn(store, idPet);

  if (scenario === 1) {
    addRecord(store, card.idCard, vaccine(1), daysAgo(100), { batchNumber: "RAB-2026-01" });
    addRecord(store, card.idCard, vaccine(3), daysAgo(40), { batchNumber: "MOQ-0415" });
  } else {
    addRecord(store, card.idCard, vaccine(1), daysAgo(340), { batchNumber: "RAB-2025-11" });
    addRecord(store, card.idCard, vaccine(2), daysAgo(45));
    addRecord(store, card.idCard, vaccine(2), daysAgo(24), { notes: "Sin reacciones adversas." });
    addRecord(store, card.idCard, vaccine(5), daysAgo(60));
    addRecord(store, card.idCard, vaccine(5), daysAgo(30), { notes: "Esquema completo." });
  }

  writeStore(store);
}

// ---- API simulada ----

export const vaccinationMock: VaccinationBackend = {
  async getCatalog() {
    await delay();
    return CATALOG;
  },

  async getCardByPet(idPet) {
    await delay();
    const store = readStore();
    seedPet(store, idPet);
    return store.cards.find((c) => c.idPet === idPet) ?? null;
  },

  async createCard(idPet) {
    await delay();
    const store = readStore();
    seedPet(store, idPet);
    const card = createCardIn(store, idPet);
    writeStore(store);
    return card;
  },

  async getRecordsByCard(idCard) {
    await delay();
    return readStore().records.filter((r) => r.idCard === idCard);
  },

  async registerRecord(request) {
    await delay();
    const store = readStore();

    if (!store.cards.some((c) => c.idCard === request.idCard)) {
      throw new Error(`No existe el carnet de vacunación con id ${request.idCard}.`);
    }

    const vaccine = CATALOG.find((v) => v.idVaccine === request.idVaccine);
    if (!vaccine) throw new Error(`No existe la vacuna con id ${request.idVaccine}.`);

    const applied = store.records.filter((r) => r.idCard === request.idCard && r.idVaccine === request.idVaccine).length;
    if (applied + 1 > vaccine.dosesRequired) {
      throw new Error(`El esquema de ${vaccine.name} ya está completo.`);
    }

    const record = addRecord(store, request.idCard, vaccine, request.applicationDate, {
      batchNumber: request.batchNumber,
      notes: request.notes,
      idDoctor: request.idDoctor,
    });

    writeStore(store);
    return record;
  },

  async getPending(days) {
    await delay();

    // El estado inicial se crea al consultar cada mascota; aquí se consultan las del backend real.
    const store = readStore();
    const pets = await getPets(0, 100).then((page) => page.content).catch(() => []);
    for (const pet of pets) seedPet(store, pet.idPet);

    return store.records
      .filter((record) => {
        if (!record.nextDoseDate) return false;
        const remaining = daysFromToday(record.nextDoseDate);
        if (remaining === null || remaining > days) return false;

        const superseded = store.records.some(
          (other) => other.idCard === record.idCard && other.idVaccine === record.idVaccine && other.doseNumber > record.doseNumber,
        );
        return !superseded;
      })
      .sort((a, b) => (a.nextDoseDate ?? "").localeCompare(b.nextDoseDate ?? ""));
  },
};
