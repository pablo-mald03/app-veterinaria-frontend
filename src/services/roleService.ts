import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import { Page } from "@/types/pagination";
import { Role } from "@/types/role";

export type { Role } from "@/types/role";

//Fetch page method
async function fetchPage(page: number, size: number): Promise<Page<Role>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    const response = await apiFetch(`${ENDPOINTS.ROLES.LIST}?${params}`);

    await ensureOk(response, "Error al obtener roles.");
    return response.json();
}

//Role service
export const roleService = {

    //Role fetching page
    getPage: fetchPage,

    //Get all roles method
    getAll: async (): Promise<Role[]> => {
        const data = await fetchPage(0, 50);
        return data.content ?? [];
    },
};