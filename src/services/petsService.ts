import { ENDPOINTS } from "@/config/api";
import {
  PaginationResult,
  PetRequest,
  PetResponse,
} from "@/types/pet-api";

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return body.message || fallback;
  } catch {
    return fallback;
  }
}

async function ensureOk(response: Response, fallback: string) {
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, fallback));
  }
}

export async function getPets(
  pageNumber = 0,
  pageSize = 10,
  sortBy = "idPet",
  direction = "asc",
): Promise<PaginationResult<PetResponse>> {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
    sortBy,
    direction,
  });

  const response = await fetch(`${ENDPOINTS.PETS.LIST}?${params}`, {
    credentials: "include",
  });

  await ensureOk(response, "No se pudieron cargar las mascotas");
  return response.json();
}

export async function getPetById(id: number): Promise<PetResponse> {
  const response = await fetch(ENDPOINTS.PETS.DETAIL(id), {
    credentials: "include",
  });

  await ensureOk(response, "No se pudo cargar la mascota");
  return response.json();
}

export async function createPet(pet: PetRequest): Promise<void> {
  const response = await fetch(ENDPOINTS.PETS.CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(pet),
  });

  await ensureOk(response, "No se pudo crear la mascota");
}

export async function updatePet(id: number, pet: PetRequest): Promise<void> {
  const response = await fetch(ENDPOINTS.PETS.UPDATE(id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(pet),
  });

  await ensureOk(response, "No se pudo actualizar la mascota");
}

export async function deletePet(id: number): Promise<void> {
  const response = await fetch(ENDPOINTS.PETS.DELETE(id), {
    method: "DELETE",
    credentials: "include",
  });

  await ensureOk(response, "No se pudo eliminar la mascota");
}