
//Table column model
export interface TableColumn<T> {
    key: string;
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