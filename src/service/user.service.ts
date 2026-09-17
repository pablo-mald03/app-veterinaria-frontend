import { ENDPOINTS } from '@/config/api';
import { UserFormData } from '@/schemas/user.schema';

export interface UserResponse extends UserFormData {
  id: number;
  rolName?: string;
  estado?: boolean;
}

interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export const userService = {
  getAll: async (
    page = 0,
    size = 20,
    sortBy = 'id',
    direction = 'asc',
  ): Promise<UserResponse[]> => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sortBy,
      direction,
    });

    const res = await fetch(`${ENDPOINTS.USERS}?${params}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al listar usuarios.');

    const data: PaginatedResponse<UserResponse> = await res.json();
    return data.content;
  },

  create: async (data: UserFormData): Promise<UserResponse> => {
    const res = await fetch(ENDPOINTS.USERS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al registrar usuario.');
    return res.json();
  },

  update: async (id: number, data: Partial<UserFormData>): Promise<UserResponse> => {
    const res = await fetch(`${ENDPOINTS.USERS}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar usuario.');
    return res.json();
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${ENDPOINTS.USERS}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al eliminar usuario.');
  },
};