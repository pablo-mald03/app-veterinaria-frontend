import { Permission } from "../permissions/permission";

//Principal role model
export interface Role {
    id: number;
    alias: string;
    name: string;
    description?: string;
    active?: boolean;
}

/** Role complete model*/
export interface RoleWithPermissions {
    id: number;
    alias: string;
    name: string;
    description?: string;
    permissions: Permission[];
    createdAt?: string;
    updatedAt?: string;
}

/** Role create request */
export interface CreateRoleRequest {
    alias: string;
    name: string;
    description?: string;
    permissionIds: number[];
}

/** Role update request*/
export interface UpdateRoleRequest {
    alias: string;
    name: string;
    description?: string;
}

/** Role status request */
export interface UpdateRoleStatusRequest {
    status: boolean;
}

/** Role permissions request */
export interface UpdateRolePermissionsRequest {
    permissionIds: number[];
}