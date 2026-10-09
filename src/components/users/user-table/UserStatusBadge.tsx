"use client";

import StatusBadge from "@/components/ui/common/StatusBadge";

interface UserStatusBadgeProps {
    active: boolean;
}

//User status badge component
export default function UserStatusBadge({ active }: UserStatusBadgeProps) {
    return <StatusBadge active={active} />;
}
