"use client";

import PetForm from "@/components/pets/PetForm";
import type { ClientResponse } from "@/types/client-api";
import type { Mascota } from "@/types/pet";
import Modal from "../ui/common/Modal";

interface PetModalProps {
    open: boolean;
    mascotaEditando: Mascota | null;
    clientes: ClientResponse[];
    onClose: () => void;
    onSave: (mascota: Mascota) => Promise<void>;
}

//Pet modal layout component
export default function PetModal({
    open,
    mascotaEditando,
    clientes,
    onClose,
    onSave,
}: PetModalProps) {
    const isEditing = Boolean(mascotaEditando);

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="2xl"
            title={isEditing ? "Editar Mascota" : "Registrar Nueva Mascota"}
            subtitle={
                isEditing
                    ? "Actualiza la información médica y datos del paciente."
                    : "Crea una nueva ficha de paciente en el sistema."
            }
        >
            <PetForm
                mascotaEditando={mascotaEditando}
                clientes={clientes}
                onSubmit={onSave}
                onCancel={onClose}
            />
        </Modal>
    );
}