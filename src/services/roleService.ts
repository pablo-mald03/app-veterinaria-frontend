import { ENDPOINTS } from '@/config/api';

export interface Role {
    id: number;
    alias: string;
    name: string;
    description?: string;
    active?: boolean;
}

export interface PaginatedRolesResponse {
    content: Role[];
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
}

export const roleService = {
    getAll: async () => {
        const url = new URL(ENDPOINTS.ROLES.LIST, window.location.origin);
        url.searchParams.append('page', '0');
        url.searchParams.append('size', '50');

        const res = await fetch(url.toString(), {
            credentials: 'include'
        });

        if (!res.ok) {
            throw new Error(`Error al obtener roles. Status: ${res.status}`);
        }

        const data = await res.json();
        return data.content ?? []; // Retorna el array del objeto paginado
    },
};