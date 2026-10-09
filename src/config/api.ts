export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    ME: `${API_BASE_URL}/auth/me`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    RECOVER_PASSWORD: `${API_BASE_URL}/auth/recover-password`,
  },

  USERS: {
    BASE: `${API_BASE_URL}/users`,
    REGISTER: `${API_BASE_URL}/users/register`,
    RECOVER_PASSWORD: `${API_BASE_URL}/users/recover-password`,
    LIST: (params: URLSearchParams) => `${API_BASE_URL}/users?${params}`,
    UPDATE: (id: number) => `${API_BASE_URL}/users/${id}`,
    PUT: (id: number) => `${API_BASE_URL}/users/${id}/roles`,
    DELETE: (id: number) => `${API_BASE_URL}/users/${id}/status`,
    REACTIVE: (id: number) => `${API_BASE_URL}/users/${id}/status`,

  },

  PETS: {
    LIST: `${API_BASE_URL}/pets/all-pets`,
    DETAIL: (id: number) => `${API_BASE_URL}/pets/${id}`,
    CREATE: `${API_BASE_URL}/pets/create`,
    UPDATE: (id: number) => `${API_BASE_URL}/pets/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/pets/${id}`,
  },

  CLIENTS: {
    LIST: `${API_BASE_URL}/clients`,
    DETAIL: (id: number) => `${API_BASE_URL}/clients/${id}`,
    CREATE: `${API_BASE_URL}/clients`,
    UPDATE: (id: number) => `${API_BASE_URL}/clients/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/clients/${id}`,
  },
  //Vaccination module
  //VACCINES (catálogo) ya existe en el backend (rama feature/vaccination).
  //VACCINATIONS (carnet por mascota y próximas a vencer) es el contrato PROPUESTO: confirmar con el backend.
  VACCINES: {
    LIST: `${API_BASE_URL}/vaccines`,
  },
  VACCINATIONS: {
    BY_PET: (petId: number) => `${API_BASE_URL}/pets/${petId}/vaccinations`,
    UPCOMING: (days: number) => `${API_BASE_URL}/vaccinations/upcoming?days=${days}`,
  },
  //Permissions module
  PERMISSIONS: {
    LIST: `${API_BASE_URL}/permissions`,
    CATALOG: `${API_BASE_URL}/permissions/catalog`,
  },
  //Role module
  ROLES: {
    LIST: `${API_BASE_URL}/roles`,
    DETAIL: (id: number) => `${API_BASE_URL}/roles/${id}`,
    UPDATE_INFO: (id: number) => `${API_BASE_URL}/roles/${id}/role`,
    UPDATE_STATUS: (id: number) => `${API_BASE_URL}/roles/${id}/status`,
    PERMISSIONS: (id: number) => `${API_BASE_URL}/roles/${id}/permissions`,
  },
};