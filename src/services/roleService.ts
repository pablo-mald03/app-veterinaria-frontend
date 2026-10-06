import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import type { Page } from "@/types/pagination";
import type {
    CreateRoleRequest,
    Role,
    RoleWithPermissions,
    UpdateRolePermissionsRequest,
    UpdateRoleRequest,
    UpdateRoleStatusRequest,
} from "@/types/roles/role";

export type { Role } from "@/types/roles/role";

// --- Helpers ---

async function parseJson<T>(response: Response, fallbackMessage: string): Promise<T> {
    await ensureOk(response, fallbackMessage);
    return response.json();
}

async function ensureOkVoid(response: Response, fallbackMessage: string): Promise<void> {
    await ensureOk(response, fallbackMessage);
}

// --- Role CRUD ---

async function getPage(page: number, size: number): Promise<Page<Role>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    const response = await apiFetch(`${ENDPOINTS.ROLES.LIST}?${params}`);
    return parseJson<Page<Role>>(response, "Error al obtener roles.");
}

async function getAll(): Promise<Role[]> {
    const data = await getPage(0, 100);
    return data.content ?? [];
}

async function getById(id: number): Promise<Role> {
    const response = await apiFetch(ENDPOINTS.ROLES.DETAIL(id));
    return parseJson<Role>(response, "Error al obtener el rol.");
}

async function getWithPermissions(id: number): Promise<RoleWithPermissions> {
    const response = await apiFetch(ENDPOINTS.ROLES.PERMISSIONS(id));
    return parseJson<RoleWithPermissions>(response, "Error al obtener los permisos del rol.");
}

async function create(data: CreateRoleRequest): Promise<Role> {
    const response = await apiFetch(ENDPOINTS.ROLES.LIST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return parseJson<Role>(response, "Error al crear rol.");
}

async function update(id: number, data: UpdateRoleRequest): Promise<Role> {
    const response = await apiFetch(ENDPOINTS.ROLES.UPDATE_INFO(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return parseJson<Role>(response, "Error al actualizar rol.");
}

async function updateStatus(id: number, status: boolean): Promise<void> {
    const body: UpdateRoleStatusRequest = { status };
    const response = await apiFetch(ENDPOINTS.ROLES.UPDATE_STATUS(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    await ensureOkVoid(response, "Error al actualizar el estado del rol.");
}

async function remove(id: number): Promise<void> {
    const response = await apiFetch(ENDPOINTS.ROLES.DETAIL(id), {
        method: "DELETE",
    });
    await ensureOkVoid(response, "Error al eliminar rol.");
}

async function updatePermissions(id: number, permissionIds: number[]): Promise<void> {
    const body: UpdateRolePermissionsRequest = { permissionIds };
    const response = await apiFetch(ENDPOINTS.ROLES.PERMISSIONS(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    await ensureOkVoid(response, "Error al actualizar los permisos del rol.");
}

// --- Public service ---

export const roleService = {
    getPage,
    getAll,
    getById,
    getWithPermissions,
    create,
    update,
    updateStatus,
    delete: remove,
    updatePermissions,
};