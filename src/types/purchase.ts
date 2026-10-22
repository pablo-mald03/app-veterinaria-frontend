import type { InventoryProductSummary } from "@/types/inventory";

export interface PurchaseDetail {
    id: number;
    quantity: number;
    unitPrice: number;
    profitPercentage: number;
    iva: number;
    product: InventoryProductSummary;
}

export interface Purchase {
    id: number;
    description: string;
    date: string;
    subtotal: number;
    total: number;
    status: string;
    user: { id: number; name?: string; username?: string } | null;
    details: PurchaseDetail[];
}

export interface PurchaseDetailRequest {
    productId: number;
    quantity: number;
    unitPrice: number;
    profitPercentage: number;
}

export interface PurchaseRequest {
    description: string;
    iva: number;
    details: PurchaseDetailRequest[];
}
