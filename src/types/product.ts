import type { Category } from "@/types/category";

//Part shared by every product listing (vaccines and dewormers only return this)
export interface ProductCatalogItem {
    id: number;
    sku: string;
    name: string;
    description: string;
    brand: string;
    provider: string;
}

//Complete product (GET /products, GET /products/{id})
export interface ProductResponse extends ProductCatalogItem {
    profitPercentage: number;
    minimumStock: number;
    price: number;
    status: boolean;
    category: Pick<Category, "id" | "name" | "status"> | null;
}

//Create / update body
export interface ProductRequest {
    sku: string;
    name: string;
    description: string;
    brand: string;
    minimumStock: number;
    price: number;
    profitPercentage: number;
    discountPercentage: number;
    expirationDate: string;
    provider: string;
    categoryId: number;
}

//Create / update response
export interface ProductSavedResponse {
    sku: string;
}

export interface ProductFilters {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: "asc" | "desc";
    priceFrom?: number;
    priceTo?: number;
    categoryId?: number;
    sku?: string;
    provider?: string;
}

//Vaccines and dewormers cannot be filtered by category
export type CatalogFilters = Omit<ProductFilters, "categoryId">;
