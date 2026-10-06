"use client";

import Modal from "@/components/ui/common/Modal";
import RoleForm from "@/components/roles/RoleForm";
import type { Role } from "@/types/roles/role";

interface RoleModalProps {
    open: boolean;
    role: Role | null;
    onClose: () => void;
    onSubmit: (data: Omit<Role, "id">) => Promise<void>;
}

//Role modal component
export default function RoleModal({ open, role, onClose, onSubmit }: RoleModalProps) {
    const isEditing = Boolean(role);

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            title={isEditing ? "Editar Rol" : "Crear Nuevo Rol"}
            subtitle={
                isEditing
                    ? "Actualiza la información del rol."
                    : "Registra un nuevo rol en el sistema."
            }
        >
            <RoleForm role={role} onSubmit={onSubmit} onCancel={onClose} />
        </Modal>
    );
}