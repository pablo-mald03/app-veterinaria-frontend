import type { ProductResponse } from "@/types/product";

//Unit price charged to the client: price + profit percentage.
//Single place to change if the backend defines the sale price differently.
export const salePrice = (product: Pick<ProductResponse, "price" | "profitPercentage">) =>
    Math.round(product.price * (1 + product.profitPercentage / 100) * 100) / 100;
