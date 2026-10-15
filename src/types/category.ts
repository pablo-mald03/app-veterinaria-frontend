export interface Category {
    id: number;
    name: string;
    description: string;
    status: boolean;
}

export interface CategoryRequest {
    name: string;
    description: string;
}

export interface CategoryPage {
    categories: Category[];
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
}

export interface CategoryFilters {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: "asc" | "desc";
    status?: boolean;
}
