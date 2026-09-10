import { ENDPOINTS } from "@/config/api";
import {
  ClientRequest,
  ClientResponse,
} from "@/types/client-api";

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

export async function getClients(): Promise<ClientResponse[]> {
  const response = await fetch(ENDPOINTS.CLIENTS.LIST, {
    credentials: "include",
  });

  await ensureOk(response, "No se pudieron cargar los clientes");
  return response.json();
}

export async function getClientById(id: number): Promise<ClientResponse> {
  const response = await fetch(ENDPOINTS.CLIENTS.DETAIL(id), {
    credentials: "include",
  });

  await ensureOk(response, "No se pudo cargar el cliente");
  return response.json();
}

export async function createClient(
  client: ClientRequest,
): Promise<ClientResponse> {
  const response = await fetch(ENDPOINTS.CLIENTS.CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(client),
  });

  await ensureOk(response, "No se pudo crear el cliente");
  return response.json();
}

export async function updateClient(
  id: number,
  client: ClientRequest,
): Promise<ClientResponse> {
  const response = await fetch(ENDPOINTS.CLIENTS.UPDATE(id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(client),
  });

  await ensureOk(response, "No se pudo actualizar el cliente");
  return response.json();
}

export async function deleteClient(id: number): Promise<void> {
  const response = await fetch(ENDPOINTS.CLIENTS.DELETE(id), {
    method: "DELETE",
    credentials: "include",
  });

  await ensureOk(response, "No se pudo eliminar el cliente");
}