"use client";

import Modal from "@/components/ui/common/Modal";
import RoomForm from "@/components/rooms/RoomForm";
import type { RoomDetailResponse, RoomRequest } from "@/types/room";

interface RoomModalProps {
    open: boolean;
    editingRoom: RoomDetailResponse | null;
    onClose: () => void;
    onSubmit: (data: RoomRequest) => Promise<void>;
}

//Room modal component
export default function RoomModal({ open, editingRoom, onClose, onSubmit }: RoomModalProps) {
    const isEditing = Boolean(editingRoom);

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            title={isEditing ? "Editar Habitación" : "Registrar Nueva Habitación"}
            subtitle={isEditing ? "Actualiza la información de la habitación." : "Crea una nueva habitación para la clínica."}
        >
            <RoomForm editingRoom={editingRoom} onSubmit={onSubmit} onCancel={onClose} />
        </Modal>
    );
}
