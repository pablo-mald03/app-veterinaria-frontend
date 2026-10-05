import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import { Page } from "@/types/pagination";
import { Role } from "@/types/role";

export type { Role } from "@/types/role";

//Role service
export const roleService = {

    //Get all fetching endpoint
    getAll: async (): Promise<Role[]> => {
        const params = new URLSearchParams({ page: "0", size: "50" });
        const response = await apiFetch(`${ENDPOINTS.ROLES.LIST}?${params}`);

        await ensureOk(response, "Error al obtener roles.");
        const data: Page<Role> = await response.json();
        return data.content ?? [];
    },
};