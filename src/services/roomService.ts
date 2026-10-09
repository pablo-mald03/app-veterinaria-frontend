import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { buildQuery, JSON_HEADERS } from "@/lib/api/http";
import { ensureOk } from "@/lib/api/ensureOk";
import type { Page } from "@/types/pagination";
import type {
    RoomDetailResponse,
    RoomFilters,
    RoomRequest,
    RoomResponse,
    RoomSavedResponse,
    RoomStatusResponse,
} from "@/types/room";

async function setStatus(id: number, status: boolean, fallback: string): Promise<RoomStatusResponse> {
  const response = await apiFetch(ENDPOINTS.ROOMS.STATUS(id), {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ status }),
  });

  await ensureOk(response, fallback);
  return response.json();
}

//Principal room service
export const roomService = {
  getAll: async ({ page = 0, size = 20, sortBy = "id", direction = "asc", ...filters }: RoomFilters = {}): Promise<Page<RoomResponse>> => {
    const params = buildQuery({ page, size, sortBy, direction, ...filters });
    const response = await apiFetch(ENDPOINTS.ROOMS.LIST(params));

    await ensureOk(response, "Error al listar las habitaciones.");
    return response.json();
  },

  getById: async (id: number): Promise<RoomDetailResponse> => {
    const response = await apiFetch(ENDPOINTS.ROOMS.DETAIL(id));

    await ensureOk(response, "Error al obtener la habitación.");
    return response.json();
  },

  create: async (data: RoomRequest): Promise<RoomSavedResponse> => {
    const response = await apiFetch(ENDPOINTS.ROOMS.CREATE, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });

    await ensureOk(response, "Error al registrar la habitación.");
    return response.json();
  },

  update: async (id: number, data: RoomRequest): Promise<RoomSavedResponse> => {
    const response = await apiFetch(ENDPOINTS.ROOMS.UPDATE(id), {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });

    await ensureOk(response, "Error al actualizar la habitación.");
    return response.json();
  },

  deactivate: (id: number) => setStatus(id, false, "Error al desactivar la habitación."),

  reactivate: (id: number) => setStatus(id, true, "Error al reactivar la habitación."),
};
