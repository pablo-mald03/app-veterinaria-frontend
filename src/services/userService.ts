import { ENDPOINTS } from '@/config/api';
import { UserFormData } from '@/schemas/user.schema';

export interface Role {
  id: number;
  alias: string;
  name: string;
  description: string;
  active: boolean;
}

export interface UserResponse {
  id: number;
  identification: string;
  name: string;
  firstName: string;
  phone: string;
  userRegistry: string;
  email: string;
  status: boolean;
  roles: Role[];
}

export const userService = {
  getAll: async (
      page: number = 0,
      size: number = 10,
      sortBy: string = "id",
      direction: string = "asc"
  ): Promise<UserResponse[]> => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sortBy,
      direction,
    });

    const res = await fetch(ENDPOINTS.USERS.LIST(params), {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Error al listar usuarios.");
    const data = await res.json();
    return data.content;
  },

  // Creación
  create: async (data: UserFormData): Promise<UserResponse> => {
    const res = await fetch(ENDPOINTS.USERS.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error('Detalle del error Backend:', errorData);

      const errorMessage = errorData?.message || (errorData?.errors
          ? JSON.stringify(errorData.errors)
          : 'Error en la validación de datos.');

      throw new Error(errorMessage);
    }
    return res.json();
  },

  // Actualización de datos de perfil
  update: async (id: number, data: Partial<UserFormData>): Promise<UserResponse> => {
    const res = await fetch(ENDPOINTS.USERS.UPDATE(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar los datos');
    }
    return res.json();
  },

  // Actualización de roles
  updateUserRoles: async (id: number, roleAliases: string[]): Promise<UserResponse> => {
    const res = await fetch(ENDPOINTS.USERS.PUT(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ roleAliases }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar los roles');
    }

    return res.json();
  },

  // Desactivación
  delete: async (id: number): Promise<void> => {
    const res = await fetch(ENDPOINTS.USERS.DELETE(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: false }),
    });
    if (!res.ok) throw new Error('Error al desactivar usuario.');
  },

  // Reactivación
  reactivate: async (id: number): Promise<void> => {
    const res = await fetch(ENDPOINTS.USERS.REACTIVE(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: true }),
    });
    if (!res.ok) throw new Error('Error al reactivar usuario.');
  },

  // Recuperación de contraseña
  recoverPassword: async (data: { email: string }): Promise<void> => {
    const res = await fetch(ENDPOINTS.USERS.RECOVER_PASSWORD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al solicitar recuperación de contraseña.');
  },
};