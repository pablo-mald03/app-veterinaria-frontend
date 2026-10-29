import { addDays, daysFromToday, toIsoDate } from "@/lib/vaccination/dates";
import { getPets } from "@/services/petsService";
import type { VaccinationBackend } from "@/services/vaccinationBackend";
import type {
  TreatmentProduct,
  TreatmentResponse,
  VaccinationCardResponse,
  VaccinationRecordResponse,
} from "@/types/vaccination-api";

// BACKEND SIMULADO de tratamientos (solo desarrollo, con NEXT_PUBLIC_USE_MOCKS=true).
// Implementa el MISMO contrato que el backend real y replica sus reglas:
//  - el número de aplicación lo calcula el servidor (registradas + 1)
//  - la próxima fecha solo existe si el tratamiento tiene intervalo
//  - cada aplicación descuenta los productos del tratamiento y calcula su costo total
//  - /pending devuelve la última aplicación de cada tratamiento con próxima fecha <= hoy + días
//  - el carnet de una mascota no existe hasta que se crea
// Es opcional: sirve para trabajar sin backend. Se puede borrar cuando ya no haga falta.

const STORAGE_KEY = "happypets.mock.vaccination.v3";
const LATENCY_MS = 300;

// Precio unitario simulado de cada producto (productId -> costo).
const PRODUCT_COSTS: Record<number, number> = { 1: 85, 2: 40, 3: 120, 4: 110, 5: 60, 6: 25 };

function estimateCost(products: TreatmentProduct[]): number {
  return products.reduce((sum, product) => sum + product.quantity * (PRODUCT_COSTS[product.productId] ?? 0), 0);
}

function treatment(
    base: Omit<TreatmentResponse, "estimatedCost">,
): TreatmentResponse {
  return { ...base, estimatedCost: estimateCost(base.products) };
}

const CATALOG: TreatmentResponse[] = [
  treatment({ idTreatment: 1, name: "Vacuna antirrábica", description: "Refuerzo anual contra la rabia", intervalDays: 365, status: true, species: ["PERRO", "GATO"], products: [{ productId: 1, quantity: 1 }] }),
  treatment({ idTreatment: 2, name: "Desparasitación interna", description: "Desparasitante oral cada tres meses", intervalDays: 90, status: true, species: ["PERRO", "GATO"], products: [{ productId: 2, quantity: 1 }] }),
  treatment({ idTreatment: 3, name: "Refuerzo de parvovirus", description: "Protección contra parvovirus canino", intervalDays: 21, status: true, species: ["PERRO"], products: [{ productId: 3, quantity: 1 }] }),
  treatment({ idTreatment: 4, name: "Triple felina", description: "Panleucopenia, rinotraqueítis y calicivirus", intervalDays: 365, status: true, species: ["GATO"], products: [{ productId: 4, quantity: 1 }] }),
  treatment({ idTreatment: 5, name: "Baño medicado", description: "Aplicación única, no se repite", intervalDays: null, status: true, species: ["PERRO", "GATO"], products: [{ productId: 5, quantity: 1 }, { productId: 6, quantity: 2 }] }),
  treatment({ idTreatment: 6, name: "Vitaminas para aves", description: "Suplemento mensual", intervalDays: 30, status: true, species: ["AVE"], products: [{ productId: 6, quantity: 2 }] }),
  treatment({ idTreatment: 7, name: "Coronavirus canino", description: "Descontinuado en la clínica", intervalDays: 365, status: false, species: ["PERRO"], products: [{ productId: 3, quantity: 1 }] }),
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

function nextDoseDateFor(item: TreatmentResponse, appliedAt: string): string | null {
  return item.intervalDays ? addDays(appliedAt, item.intervalDays) : null;
}

function addRecord(
    store: MockStore,
    idCard: number,
    item: TreatmentResponse,
    appliedAt: string,
    extra: { notes?: string; idDoctor?: number } = {},
): VaccinationRecordResponse {
  const applicationNumber = store.records.filter((r) => r.idCard === idCard && r.idTreatment === item.idTreatment).length + 1;

  const items = item.products.map((product) => ({
    productId: product.productId,
    batchId: 1,
    quantity: product.quantity,
    unitCost: PRODUCT_COSTS[product.productId] ?? 0,
  }));

  const record: VaccinationRecordResponse = {
    idRecord: store.nextRecordId++,
    idCard,
    idTreatment: item.idTreatment,
    idDoctor: extra.idDoctor ?? 1,
    applicationNumber,
    applicationDate: appliedAt,
    nextDoseDate: nextDoseDateFor(item, appliedAt),
    totalCost: items.reduce((sum, line) => sum + line.quantity * line.unitCost, 0),
    notes: extra.notes ?? null,
    items,
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
 *  - id % 3 === 1 -> uno al día y uno vencido
 *  - id % 3 === 2 -> uno por vencer, uno vencido con una aplicación anterior superada y uno de aplicación única
 */
function seedPet(store: MockStore, idPet: number): void {
  if (store.seeded.includes(idPet)) return;
  store.seeded.push(idPet);

  const find = (id: number) => CATALOG.find((t) => t.idTreatment === id)!;
  const scenario = idPet % 3;
  if (scenario === 0) return;

  const card = createCardIn(store, idPet);

  if (scenario === 1) {
    addRecord(store, card.idCard, find(1), daysAgo(100));
    addRecord(store, card.idCard, find(3), daysAgo(40));
  } else {
    addRecord(store, card.idCard, find(1), daysAgo(340));
    addRecord(store, card.idCard, find(2), daysAgo(120));
    addRecord(store, card.idCard, find(2), daysAgo(20), { notes: "Sin reacciones adversas." });
    addRecord(store, card.idCard, find(5), daysAgo(15));
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
      throw new Error(`No existe el carnet con id ${request.idCard}.`);
    }

    const found = CATALOG.find((t) => t.idTreatment === request.idTreatment);
    if (!found) throw new Error(`No existe el tratamiento con id ${request.idTreatment}.`);
    if (!found.status) throw new Error(`El tratamiento ${found.name} está inactivo.`);

    const record = addRecord(store, request.idCard, found, request.applicationDate, {
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
              (other) => other.idCard === record.idCard && other.idTreatment === record.idTreatment && other.applicationNumber > record.applicationNumber,
          );
          return !superseded;
        })
        .sort((a, b) => (a.nextDoseDate ?? "").localeCompare(b.nextDoseDate ?? ""));
  },
};
