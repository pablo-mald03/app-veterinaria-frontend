import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import { ClientRequest, ClientResponse } from "@/types/client-api";

export async function getClients(): Promise<ClientResponse[]> {
  const response = await apiFetch(ENDPOINTS.CLIENTS.LIST);

  await ensureOk(response, "No se pudieron cargar los clientes");
  return response.json();
}

export async function getClientById(id: number): Promise<ClientResponse> {
  const response = await apiFetch(ENDPOINTS.CLIENTS.DETAIL(id));

  await ensureOk(response, "No se pudo cargar el cliente");
  return response.json();
}

export async function createClient(client: ClientRequest): Promise<ClientResponse> {
  const response = await apiFetch(ENDPOINTS.CLIENTS.CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
  });

  await ensureOk(response, "No se pudo crear el cliente");
  return response.json();
}

export async function updateClient(id: number, client: ClientRequest): Promise<ClientResponse> {
  const response = await apiFetch(ENDPOINTS.CLIENTS.UPDATE(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
  });

  await ensureOk(response, "No se pudo actualizar el cliente");
  return response.json();
}

export async function deleteClient(id: number): Promise<void> {
  const response = await apiFetch(ENDPOINTS.CLIENTS.DELETE(id), {
    method: "DELETE",
  });

  await ensureOk(response, "No se pudo eliminar el cliente");
}