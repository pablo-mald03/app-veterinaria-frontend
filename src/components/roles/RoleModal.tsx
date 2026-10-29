"use client";

import Modal from "@/components/ui/common/Modal";
import RoleForm, { type RoleFormValues } from "@/components/roles/RoleForm";
import type { Role } from "@/types/roles/role";

interface RoleModalProps {
    open: boolean;
    role: Role | null;
    onClose: () => void;
    onSubmit: (data: RoleFormValues) => Promise<void>;
}

//Role modal component
export default function RoleModal({ open, role, onClose, onSubmit }: RoleModalProps) {
    const isEditing = Boolean(role);

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="2xl"
            title={isEditing ? "Editar Rol" : "Crear Nuevo Rol"}
            subtitle={
                isEditing
                    ? "Actualiza la información y los permisos del rol."
                    : "Registra un nuevo rol y asígnale sus permisos."
            }
        >
            <RoleForm role={role} onSubmit={onSubmit} onCancel={onClose} />
        </Modal>
    );
}