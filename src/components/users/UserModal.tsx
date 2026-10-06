// src/components/users/UserModal.tsx
"use client";

import Modal from "@/components/ui/common/Modal";
import UserForm from "@/components/users/UserForm";
import type { UserFormData } from "@/schemas/user.schema";
import type { UserResponse } from "@/services/userService";

interface UserModalProps {
  isOpen: boolean;
  editingUser: UserResponse | null;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
}

//User modal component
export default function UserModal({ isOpen, editingUser, onClose, onSubmit }: UserModalProps) {
  const isEditing = Boolean(editingUser);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="2xl"
      title={isEditing ? "Editar Usuario" : "Registrar Nuevo Usuario"}
      subtitle={isEditing ? "Actualiza los datos del perfil." : "Crea un nuevo acceso al sistema."}
    >
      { }
      <UserForm editingUser={editingUser} onSubmit={onSubmit} onCancel={onClose} />
    </Modal>
  );
}