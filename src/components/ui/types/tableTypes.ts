
//Sorting model (optional, used by tables that sort their rows)
export type SortDirection = "asc" | "desc";

export interface SortState {
    key: string;
    direction: SortDirection;
}

//Table column model
export interface TableColumn<T> {
    key: string;
    sortable?: boolean;
    header: string;
    render?: (row: T) => React.ReactNode;
    align?: "left" | "center" | "right";
    className?: string;
    width?: string;
}

//Empty state
export interface EmptyState {
    title: string;
    description?: string;
    icon?: React.ReactNode;
}