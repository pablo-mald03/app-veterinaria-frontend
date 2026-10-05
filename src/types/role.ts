//Role model
export interface Role {
    id: number;
    alias: string;
    name: string;
    description?: string;
    active?: boolean;
}