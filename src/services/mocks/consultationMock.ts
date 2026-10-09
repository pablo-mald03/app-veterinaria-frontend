import type { ConsultationBackend } from "@/services/consultationBackend";
import type { AppointmentRequest, AppointmentResponse, MedicalConsultationRequest } from "@/types/consultation-api";

// BACKEND SIMULADO de citas/consultas (solo desarrollo, con NEXT_PUBLIC_USE_MOCKS=true).
// Implementa el mismo contrato que el backend real: crea la cita y luego la completa con
// diagnóstico, tratamiento y costo, igual que PATCH /appointments/{id}/diagnosis.
// Es opcional: sirve para trabajar sin backend. Se puede borrar cuando el módulo de citas
// se fusione a develop y arranque.

const STORAGE_KEY = "happypets.mock.consultations.v1";
const LATENCY_MS = 300;

interface MockStore {
  nextId: number;
  byPet: Record<string, AppointmentResponse[]>;
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
export function resetConsultationMock(): void {
  writeStore({ nextId: 1, byPet: {} });
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function nowDateTime(): { date: string; hour: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    hour: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
  };
}

export const consultationMock: ConsultationBackend = {
  async getHistoryByPet(petId) {
    await delay();
    const list = readStore().byPet[String(petId)] ?? [];
    // más reciente primero, igual que el backend (ORDER BY date DESC, hour DESC)
    return [...list].sort((a, b) => (a.date === b.date ? (a.hour < b.hour ? 1 : -1) : a.date < b.date ? 1 : -1));
  },

  async createAppointment(request: AppointmentRequest) {
    await delay();
    const store = readStore();
    const { date, hour } = nowDateTime();

    const appointment: AppointmentResponse = {
      id: store.nextId++,
      petId: request.petId,
      userId: request.userId,
      roomId: request.roomId ?? null,
      date: request.date || date,
      hour: request.hour || hour,
      description: request.description,
      diagnosis: request.diagnosis ?? null,
      treatment: null,
      cost: null,
      status: "SCHEDULED",
    };

    const key = String(request.petId);
    store.byPet[key] = [...(store.byPet[key] ?? []), appointment];
    writeStore(store);
    return appointment;
  },

  async completeAppointment(id, request: MedicalConsultationRequest) {
    await delay();
    const store = readStore();

    for (const key of Object.keys(store.byPet)) {
      const list = store.byPet[key];
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) continue;

      const current = list[index];
      if (current.status === "CANCELLED") throw new Error("No se puede completar una cita cancelada.");
      if (current.status === "COMPLETED") throw new Error("Esta cita ya fue completada.");

      const updated: AppointmentResponse = {
        ...current,
        diagnosis: request.diagnosis,
        treatment: request.treatment,
        cost: request.cost,
        status: "COMPLETED",
      };

      list[index] = updated;
      writeStore(store);
      return updated;
    }

    throw new Error(`No existe la cita con id ${id}.`);
  },
};
