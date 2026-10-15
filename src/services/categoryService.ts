import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { buildQuery, JSON_HEADERS } from "@/lib/api/http";
import { ensureOk } from "@/lib/api/ensureOk";
import type { CategoryFilters, CategoryPage, CategoryRequest } from "@/types/category";

export const categoryService = {
    getAll: async ({
        page = 0,
        size = 10,
        sortBy = "name",
        direction = "asc",
        status,
    }: CategoryFilters = {}): Promise<CategoryPage> => {
        const params = buildQuery({ page, size, sortBy, direction, status });
        const response = await apiFetch(ENDPOINTS.CATEGORIES.LIST(params));
        await ensureOk(response, "Error al listar las categorías.");
        return response.json();
    },

    create: async (data: CategoryRequest): Promise<{ name: string }> => {
        const response = await apiFetch(ENDPOINTS.CATEGORIES.CREATE, {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(data),
        });
        await ensureOk(response, "Error al crear la categoría.");
        return response.json();
    },

    update: async (id: number, data: CategoryRequest): Promise<{ name: string }> => {
        const response = await apiFetch(ENDPOINTS.CATEGORIES.UPDATE(id), {
            method: "PUT",
            headers: JSON_HEADERS,
            body: JSON.stringify(data),
        });
        await ensureOk(response, "Error al actualizar la categoría.");
        return response.json();
    },

    setStatus: async (id: number, status: boolean): Promise<void> => {
        const response = await apiFetch(ENDPOINTS.CATEGORIES.STATUS(id), {
            method: "PATCH",
            headers: JSON_HEADERS,
            body: JSON.stringify({ status }),
        });
        await ensureOk(response, "Error al actualizar el estado de la categoría.");
    },
};
