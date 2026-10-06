"use client";

import type { UserResponse } from "@/services/userService";
import UserRoleBadge from "@/components/users/user-table/UserRoleBadge";
import UserStatusBadge from "@/components/users/user-table/UserStatusBadge";
import UserRowActions from "@/components/users/user-table/UserRowActions";

interface UserRowProps {
    user: UserResponse;
    canEdit: boolean;
    canDeactivate: boolean;
    onEdit: (user: UserResponse) => void;
    onDeactivate: (user: UserResponse) => void;
    onReactivate: (user: UserResponse) => void;
}

//User row component 
export default function UserRow({
    user,
    canEdit,
    canDeactivate,
    onEdit,
    onDeactivate,
    onReactivate,
}: UserRowProps) {
    return (
        <tr className="transition-colors hover:bg-mint/30">
            <td className="p-4">
                <div className="font-semibold text-text">
                    {user.name} {user.firstName}
                </div>
                <div className="text-xs font-medium text-accent">@{user.userRegistry}</div>
            </td>
            <td className="p-4 font-mono text-xs">{user.identification}</td>
            <td className="p-4">
                <div>{user.email}</div>
                <div className="text-xs text-text/60">{user.phone}</div>
            </td>
            <td className="p-4">
                <UserRoleBadge roleName={user.roles?.[0]?.name} />
            </td>
            <td className="p-4">
                <UserStatusBadge active={user.status} />
            </td>
            <td className="p-4 text-center">
                <UserRowActions
                    active={user.status}
                    canEdit={canEdit}
                    canDeactivate={canDeactivate}
                    onEdit={() => onEdit(user)}
                    onDeactivate={() => onDeactivate(user)}
                    onReactivate={() => onReactivate(user)}
                />
            </td>
        </tr>
    );
}