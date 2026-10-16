"use client";

import { useEffect, useMemo, useState } from "react";
import { productService } from "@/services/productService";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { formatCost } from "@/lib/consultation/money";
import { salePrice } from "@/lib/products/pricing";
import type { DropdownOption } from "@/components/ui/common/Dropdown";
import type { ProductResponse } from "@/types/product";

const PAGE_SIZE = 100;

//The products list is paginated, so every page is requested to fill the selector
async function fetchAllProducts(): Promise<ProductResponse[]> {
    const first = await productService.getAll({ size: PAGE_SIZE });
    const rest = await Promise.all(
        Array.from({ length: Math.max(first.totalPages - 1, 0) }, (_, i) => productService.getAll({ size: PAGE_SIZE, page: i + 1 })),
    );

    return [first, ...rest].flatMap((p) => p.content);
}

//Active products as selector options; they are only requested once `enabled` is true
export function useSupplyProducts(enabled = true) {
    const toast = useToast();
    const [products, setProducts] = useState<ProductResponse[] | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!enabled || products !== null || failed) return;
        let active = true;

        fetchAllProducts()
            .then((result) => {
                if (active) setProducts(result.filter((p) => p.status));
            })
            .catch((err: unknown) => {
                if (!active) return;
                setFailed(true);
                toast.error(err instanceof Error ? err.message : "No se pudieron cargar los productos.", "Error al cargar productos");
            });

        return () => {
            active = false;
        };
    }, [enabled, products, failed, toast]);

    return useMemo(() => {
        const list = products ?? [];

        return {
            loading: enabled && products === null && !failed,
            options: list.map((p): DropdownOption => ({ value: String(p.id), label: p.name, hint: `${p.sku} · ${formatCost(salePrice(p))}` })),
            find: (id: string) => list.find((p) => String(p.id) === id),
        };
    }, [enabled, products, failed]);
}
