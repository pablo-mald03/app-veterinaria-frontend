//Log entry model
export interface LogResponse {
    id: number;
    module: string;
    action: string;
    detail: string;
    userId: number;
    userRegistry: string;
    userIdentification: string;
    createdAt: string;
}

export interface LogPageResponse {
    logs: LogResponse[];
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
}

//Log filters
export interface LogFilters {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: "asc" | "desc";
    module?: string;
    createdFrom?: string;
    createdTo?: string;
}
