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

  ROLES: {
    LIST: `${API_BASE_URL}/roles`,
  },
};