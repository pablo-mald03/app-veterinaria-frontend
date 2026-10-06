import { Role } from "@/types/roles/role";

//User response module
export interface UserResponse {
    id: number;
    identification: string;
    name: string;
    firstName: string;
    phone: string;
    userRegistry: string;
    email: string;
    status: boolean;
    roles: Role[];
}