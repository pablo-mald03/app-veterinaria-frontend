import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { buildQuery } from "@/lib/api/http";
import { ensureOk } from "@/lib/api/ensureOk";
import type { Page } from "@/types/pagination";
import type { InventoryBatch, InventoryMovement, LowStockProduct, ProductStockSummary } from "@/types/inventory";
import type { Purchase, PurchaseRequest } from "@/types/purchase";
import { JSON_HEADERS } from "@/lib/api/http";

type PagePayload<T> = Omit<Page<T>, "content"> & { content?: T[]; batches?: T[]; movements?: T[]; purchases?: T[] };

async function getPage<T>(url: string, listKey: "content" | "batches" | "movements" | "purchases", message: string): Promise<Page<T>> {
    const response = await apiFetch(url);
    await ensureOk(response, message);
    if (response.status === 204) {
        return { content: [], page: 0, size: 0, totalPages: 0, totalElements: 0 };
    }

    const data = (await response.json()) as PagePayload<T>;
    return {
        content: data[listKey] ?? [],
        page: data.page,
        size: data.size,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
    };
}

const pageParams = (page: number, size: number) => buildQuery({ page, size });

export const inventoryService = {
    getPurchases: (page = 0, size = 20) =>
        getPage<Purchase>(
            ENDPOINTS.PURCHASES.LIST(pageParams(page, size)),
            "purchases",
            "No se pudieron cargar las compras.",
        ),
    createPurchase: async (data: PurchaseRequest): Promise<Purchase> => {
        const response = await apiFetch(ENDPOINTS.PURCHASES.CREATE, {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(data),
        });
        await ensureOk(response, "No se pudo registrar la compra.");
        return response.json() as Promise<Purchase>;
    },
    getStockSummary: (page = 0, size = 20) =>
        getPage<ProductStockSummary>(
            ENDPOINTS.INVENTORY_BATCHES.STOCK_SUMMARY(pageParams(page, size)),
            "content",
            "No se pudo cargar el resumen de existencias.",
        ),
    getLowStock: (page = 0, size = 20) =>
        getPage<LowStockProduct>(
            ENDPOINTS.INVENTORY_BATCHES.LOWER(pageParams(page, size)),
            "content",
            "No se pudieron cargar las alertas de stock bajo.",
        ),
    getBatches: (page = 0, size = 20) =>
        getPage<InventoryBatch>(
            ENDPOINTS.INVENTORY_BATCHES.LIST(pageParams(page, size)),
            "batches",
            "No se pudieron cargar los lotes de inventario.",
        ),
    getBatchById: async (id: number): Promise<InventoryBatch> => {
        const response = await apiFetch(ENDPOINTS.INVENTORY_BATCHES.DETAIL(id));
        await ensureOk(response, "No se pudo cargar el lote de inventario.");
        return response.json() as Promise<InventoryBatch>;
    },
    getMovements: (page = 0, size = 20) =>
        getPage<InventoryMovement>(
            ENDPOINTS.INVENTORY_MOVEMENTS.LIST(pageParams(page, size)),
            "movements",
            "No se pudo cargar el historial de movimientos.",
        ),
    getMovementById: async (id: number): Promise<InventoryMovement> => {
        const response = await apiFetch(ENDPOINTS.INVENTORY_MOVEMENTS.DETAIL(id));
        await ensureOk(response, "No se pudo cargar el movimiento de inventario.");
        return response.json() as Promise<InventoryMovement>;
    },
};
