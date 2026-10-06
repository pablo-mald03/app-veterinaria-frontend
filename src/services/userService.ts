import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import { UserFormData } from "@/schemas/user.schema";
import { Page } from "@/types/pagination";
import { UserResponse } from "@/types/users/user";

export type { UserResponse } from "@/types/users/user";
export type { Role } from "@/types/roles/role";

const JSON_HEADERS = { "Content-Type": "application/json" };

async function setStatus(id: number, status: boolean, fallback: string): Promise<void> {
  const response = await apiFetch(ENDPOINTS.USERS.DELETE(id), {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ status }),
  });

  await ensureOk(response, fallback);
}

//Principal user service
export const userService = {
  getAll: async (
    page: number = 0,
    size: number = 20,
    sortBy: string = "id",
    direction: string = "asc",
  ): Promise<UserResponse[]> => {
    const params = new URLSearchParams({ page: String(page), size: String(size), sortBy, direction });
    const response = await apiFetch(ENDPOINTS.USERS.LIST(params));

    await ensureOk(response, "Error al listar usuarios.");
    const data: Page<UserResponse> = await response.json();
    return data.content;
  },

  create: async (data: UserFormData): Promise<UserResponse> => {
    const response = await apiFetch(ENDPOINTS.USERS.REGISTER, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });

    await ensureOk(response, "Error en la validación de datos.");
    return response.json();
  },

  update: async (id: number, data: Partial<UserFormData>): Promise<UserResponse> => {
    const response = await apiFetch(ENDPOINTS.USERS.UPDATE(id), {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    });

    await ensureOk(response, "Error al actualizar los datos.");
    return response.json();
  },

  updateUserRoles: async (id: number, roleAliases: string[]): Promise<UserResponse> => {
    const response = await apiFetch(ENDPOINTS.USERS.PUT(id), {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({ roleAliases }),
    });

    await ensureOk(response, "Error al actualizar los roles.");
    return response.json();
  },

  delete: (id: number): Promise<void> => setStatus(id, false, "Error al desactivar usuario."),

  reactivate: (id: number): Promise<void> => setStatus(id, true, "Error al reactivar usuario."),

  recoverPassword: async (data: { email: string }): Promise<void> => {
    const response = await fetch(ENDPOINTS.USERS.RECOVER_PASSWORD, {
      method: "POST",
      headers: JSON_HEADERS,
      credentials: "include",
      body: JSON.stringify(data),
    });

    await ensureOk(response, "Error al solicitar recuperación de contraseña.");
  },
};