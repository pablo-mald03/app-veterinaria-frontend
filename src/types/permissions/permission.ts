/*Principal permissions model interface */
export interface Permission {
    id: number;
    module: string;
    action: string;
    description: string;
}

/*Principal permission catalog model */
export interface PermissionCatalog {
    modules: string[];
    actions: string[];
}

/*Principal permission page */
export interface PermissionPage {
    permissions: Permission[];
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
}

//Permissions filter
export interface PermissionFilters {
    moduleTarget?: string;
    actionTarget?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: "asc" | "desc";
}