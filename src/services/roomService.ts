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

async function fetchRooms(params: URLSearchParams): Promise<Page<RoomResponse>> {
  const response = await apiFetch(ENDPOINTS.ROOMS.LIST(params));

  await ensureOk(response, "Error al listar las habitaciones.");
  return response.json();
}

//Rooms requested per field when searching (a clinic has few rooms, so this covers every match)
const SEARCH_FETCH_SIZE = 200;

//Principal room service
export const roomService = {
  getAll: async ({ page = 0, size = 20, sortBy = "id", direction = "asc", search, ...filters }: RoomFilters = {}): Promise<Page<RoomResponse>> => {
    const term = search?.trim();
    if (!term) return fetchRooms(buildQuery({ page, size, sortBy, direction, ...filters }));

    // The API has no free-text filter: name, location and number are queried in parallel,
    // merged without duplicates and paginated here.
    const base = { page: 0, size: SEARCH_FETCH_SIZE, sortBy, direction, ...filters };
    const byField = [{ name: term }, { location: term }, ...(/^\d{1,9}$/.test(term) ? [{ number: Number(term) }] : [])];
    const results = await Promise.all(byField.map((field) => fetchRooms(buildQuery({ ...base, ...field }))));

    const merged = [...new Map(results.flatMap((r) => r.content).map((room) => [room.id, room])).values()].sort((a, b) =>
        direction === "desc" ? b.id - a.id : a.id - b.id,
    );

    return {
      content: merged.slice(page * size, (page + 1) * size),
      page,
      size,
      totalPages: Math.ceil(merged.length / size),
      totalElements: merged.length,
    };
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
