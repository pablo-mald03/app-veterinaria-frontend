import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import { Permission, PermissionCatalog, PermissionPage } from "@/types/permissions/permission";

async function fetchPage(page: number, size: number): Promise<PermissionPage> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    const response = await apiFetch(`${ENDPOINTS.PERMISSIONS.LIST}?${params}`);

    await ensureOk(response, "Error al obtener permisos.");
    return response.json();
}

//Permission service
export const permissionService = {
    getPage: fetchPage,

    //Fetch all permissions pageable method
    getAll: async (size: number = 100): Promise<Permission[]> => {
        const first = await fetchPage(0, size);
        const rest = await Promise.all(
            Array.from({ length: Math.max(first.totalPages - 1, 0) }, (_, i) => fetchPage(i + 1, size)),
        );

        return [first, ...rest].flatMap((p) => p.permissions);
    },

    //Get catalog for permissions method
    getCatalog: async (): Promise<PermissionCatalog> => {
        const response = await apiFetch(ENDPOINTS.PERMISSIONS.CATALOG);

        await ensureOk(response, "Error al obtener el catálogo de permisos.");
        return response.json();
    },
};