export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api/v1";

// Ruta del controlador de carnets tal como está hoy en el backend (ver ENDPOINTS.VACCINATION_CARDS).
const VACCINATION_CARDS_PATH = "/vaccination-cards";

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
  //Logs module
  LOGS: {
    LIST: (params: URLSearchParams) => `${API_BASE_URL}/logs?${params}`,
    MODULES: `${API_BASE_URL}/logs/modules`,
  },
  //Appointments module (citas/consultas; rama feature/module-appointments, aún no está en develop)
  APPOINTMENTS: {
    BASE: `${API_BASE_URL}/appointments`,
    DETAIL: (id: number) => `${API_BASE_URL}/appointments/${id}`,
    HISTORY_BY_PET: (petId: number) => `${API_BASE_URL}/appointments/pet/${petId}/history`,
    UPDATE_DIAGNOSIS: (id: number) => `${API_BASE_URL}/appointments/${id}/diagnosis`,
    UPDATE_STATUS: (id: number) => `${API_BASE_URL}/appointments/${id}/status`,
  },
  //Vaccination module (contrato REAL del backend, rama develop)
  VACCINES: {
    LIST: `${API_BASE_URL}/vaccines`,
    DETAIL: (id: number) => `${API_BASE_URL}/vaccines/${id}`,
  },
  VACCINATION_CARDS: {
    // OJO: el backend declara @RequestMapping("/api/vaccination-cards") y ya existe el context-path
    // /api/v1, por eso queda "/api/v1/api/vaccination-cards". Cuando lo corrijan en el backend,
    // cambiar VACCINATION_CARDS_PATH a "/vaccination-cards" (único lugar).
    BY_PET: (petId: number) => `${API_BASE_URL}${VACCINATION_CARDS_PATH}/pet/${petId}`,
  },
  VACCINATION_RECORDS: {
    BASE: `${API_BASE_URL}/vaccination-records`,
    BY_CARD: (cardId: number) => `${API_BASE_URL}/vaccination-records/${cardId}`,
    PENDING: (days: number) => `${API_BASE_URL}/vaccination-records/pending?days=${days}`,
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