export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    ME: `${API_BASE_URL}/auth/me`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    RECOVER_PASSWORD: `${API_BASE_URL}/auth/recover-password`,
  },

  USERS: `${API_BASE_URL}/users`,

  PETS: {
    LIST: `${API_BASE_URL}/pets`,
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
};