import { ENDPOINTS } from "@/config/api";
import { apiFetch } from "@/lib/api/apiFetch";
import { buildQuery, JSON_HEADERS } from "@/lib/api/http";
import { ensureOk } from "@/lib/api/ensureOk";
import type { Page } from "@/types/pagination";
import type {
    CatalogFilters,
    ProductCatalogItem,
    ProductFilters,
    ProductRequest,
    ProductResponse,
    ProductSavedResponse,
} from "@/types/product";

type PageMeta = Omit<Page<unknown>, "content">;

//Each listing names its array differently (products, vaccinations...); it is normalized to Page<T>
async function getPage<T>(url: string, listKey: string, fallback: string): Promise<Page<T>> {
    const response = await apiFetch(url);

    await ensureOk(response, fallback);
    const data: PageMeta & Record<string, unknown> = await response.json();

    return {
        page: data.page,
        size: data.size,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        content: (data[listKey] as T[] | undefined) ?? [],
    };
}

const listParams = ({ page = 0, size = 20, sortBy = "name", direction = "asc", ...filters }: ProductFilters) =>
    buildQuery({ page, size, sortBy, direction, ...filters });

//Principal product service
export const productService = {
    getAll: (filters: ProductFilters = {}) =>
        getPage<ProductResponse>(ENDPOINTS.PRODUCTS.LIST(listParams(filters)), "products", "Error al listar los productos."),

    // Read-only listings, ready to feed selectors in vaccination / consultations
    getVaccines: (filters: CatalogFilters = {}) =>
        getPage<ProductCatalogItem>(ENDPOINTS.PRODUCTS.VACCINES(listParams(filters)), "vaccinations", "Error al listar las vacunas."),

    getDewormers: (filters: CatalogFilters = {}) =>
        getPage<ProductCatalogItem>(ENDPOINTS.PRODUCTS.DEWORMERS(listParams(filters)), "vaccinations", "Error al listar los desparasitantes."),

    getById: async (id: number): Promise<ProductResponse> => {
        const response = await apiFetch(ENDPOINTS.PRODUCTS.DETAIL(id));

        await ensureOk(response, "Error al obtener el producto.");
        return response.json();
    },

    create: async (data: ProductRequest): Promise<ProductSavedResponse> => {
        const response = await apiFetch(ENDPOINTS.PRODUCTS.CREATE, {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(data),
        });

        await ensureOk(response, "Error al registrar el producto.");
        return response.json();
    },

    update: async (id: number, data: ProductRequest): Promise<ProductSavedResponse> => {
        const response = await apiFetch(ENDPOINTS.PRODUCTS.UPDATE(id), {
            method: "PUT",
            headers: JSON_HEADERS,
            body: JSON.stringify(data),
        });

        await ensureOk(response, "Error al actualizar el producto.");
        return response.json();
    },

    setStatus: async (id: number, status: boolean): Promise<void> => {
        const response = await apiFetch(ENDPOINTS.PRODUCTS.STATUS(id), {
            method: "PATCH",
            headers: JSON_HEADERS,
            body: JSON.stringify({ status }),
        });

        await ensureOk(response, status ? "Error al reactivar el producto." : "Error al desactivar el producto.");
    },
};
