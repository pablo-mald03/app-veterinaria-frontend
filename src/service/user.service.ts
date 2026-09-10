import { ENDPOINTS } from '@/config/api';
import { UserFormData } from '@/schemas/user.schema';

export interface UserResponse extends UserFormData {
  id: number;
  rolName?: string;
  estado?: boolean;
}

export const userService = {
  getAll: async (): Promise<UserResponse[]> => {
    const res = await fetch(ENDPOINTS.USERS, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al listar usuarios.');
    return res.json();
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