import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { ensureOk } from "@/lib/api/ensureOk";
import type { LogFilters, LogPage } from "@/types/log";

export const logService = {
    getAll: async (filters: LogFilters = {}): Promise<LogPage> => {
        const { page = 0, size = 20, sortBy = "createdAt", direction = "desc", module, createdFrom, createdTo } = filters;

        const params = new URLSearchParams({ page: String(page), size: String(size), sortBy, direction });
        if (module) params.set("module", module);
        if (createdFrom) params.set("createdFrom", createdFrom);
        if (createdTo) params.set("createdTo", createdTo);

        const response = await apiFetch(ENDPOINTS.LOGS.LIST(params));
        await ensureOk(response, "Error al listar los logs.");
        return response.json();
    },

    getModules: async (): Promise<string[]> => {
        const response = await apiFetch(ENDPOINTS.LOGS.MODULES);
        await ensureOk(response, "Error al listar los módulos de logs.");
        return response.json();
    },
};
