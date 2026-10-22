export interface SaleDetail {
    id: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: { id: number; name: string; sku: string; minimumStock: number };
}

export interface Sale {
    id: number;
    billNumber: string | null;
    date: string;
    subtotal: number;
    iva: number;
    total: number;
    status: string;
    user: { id: number; userRegistry: string; email: string } | null;
    details: SaleDetail[];
}

export interface SaleItemRequest {
    productId: number;
    quantity: number;
    unitPrice: number;
}

export interface SaleRequest {
    billNumber: string;
    date?: string;
    iva: number;
    items: SaleItemRequest[];
}
