import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import type {
    Permission,
    PermissionCatalog,
    PermissionFilters,
    PermissionPage,
} from "@/types/permissions/permission";

async function fetchPage(filters: PermissionFilters = {}): Promise<PermissionPage> {
    const {
        page = 0,
        size = 20,
        sortBy = "module",
        direction = "asc",
        moduleTarget,
        actionTarget,
    } = filters;

    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        sortBy,
        direction,
    });

    if (moduleTarget) params.set("moduleTarget", moduleTarget);
    if (actionTarget) params.set("actionTarget", actionTarget);

    const response = await apiFetch(`${ENDPOINTS.PERMISSIONS.LIST}?${params}`);
    await ensureOk(response, "Error al obtener permisos.");
    return response.json();
}

/** Fetches every permission across all pages. */
async function getAll(size = 100): Promise<Permission[]> {
    const first = await fetchPage({ page: 0, size });
    const rest = await Promise.all(
        Array.from({ length: Math.max(first.totalPages - 1, 0) }, (_, i) =>
            fetchPage({ page: i + 1, size })
        )
    );
    return [first, ...rest].flatMap((p) => p.permissions);
}

//Principal fetch for permission catalog
async function getCatalog(): Promise<PermissionCatalog> {
    const response = await apiFetch(ENDPOINTS.PERMISSIONS.CATALOG);
    await ensureOk(response, "Error al obtener el catálogo de permisos.");
    return response.json();
}

//Permission service
export const permissionService = {
    getPage: fetchPage,
    getAll,
    getCatalog,
};