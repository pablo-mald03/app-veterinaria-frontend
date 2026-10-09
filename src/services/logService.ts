import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { buildQuery } from "@/lib/api/http";
import { ensureOk } from "@/lib/api/ensureOk";
import type { LogFilters, LogPageResponse, LogResponse } from "@/types/log";
import type { Page } from "@/types/pagination";

export const logService = {
    getAll: async ({ page = 0, size = 20, sortBy = "createdAt", direction = "desc", ...filters }: LogFilters = {}): Promise<Page<LogResponse>> => {
        const params = buildQuery({ page, size, sortBy, direction, ...filters });
        const response = await apiFetch(ENDPOINTS.LOGS.LIST(params));

        await ensureOk(response, "Error al listar los logs.");
        const { logs, ...pagination }: LogPageResponse = await response.json();
        return { content: logs ?? [], ...pagination };
    },

    getModules: async (): Promise<string[]> => {
        const response = await apiFetch(ENDPOINTS.LOGS.MODULES);

        await ensureOk(response, "Error al listar los módulos de logs.");
        return response.json();
    },
};
