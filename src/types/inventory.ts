import type { Page } from "@/types/pagination";

export interface InventoryProductSummary {
    id: number;
    name: string;
    sku: string;
    minimumStock: number;
}

export interface ProductStockSummary {
    productId: number;
    productName: string;
    productSku: string;
    minimumStock: number;
    totalAvailableStock: number;
    activeBatchesCount: number;
}

export interface LowStockProduct {
    productId: number;
    name: string;
    sku: string;
    description: string;
    currentStock: number;
    minimumStock: number;
}

export interface PurchaseDetailSummary {
    id: number;
    purchaseId: number;
    unitPrice: number;
    profitPercentage: number;
}

export interface InventoryBatch {
    id: number;
    unitaryCost: number;
    availableQuantity: number;
    profitPercentage: number;
    originalQuantity: number;
    entryDate: string;
    status: boolean;
    product: InventoryProductSummary;
    purchaseDetail: PurchaseDetailSummary;
}

export interface BatchSummary {
    id: number;
    unitaryCost: number;
    profitPercentage: number;
    availableQuantity: number;
}

export interface PurchaseSummary {
    id: number;
    description: string;
    date: string;
    total: number;
}

export type MovementType = string;

export interface InventoryMovement {
    id: number;
    type: MovementType;
    quantity: number;
    unitCost: number;
    date: string;
    origin: string;
    product: InventoryProductSummary;
    batch: BatchSummary | null;
    purchase: PurchaseSummary | null;
}

export type InventoryPage<T> = Page<T>;
