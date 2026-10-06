"use client";

import ClientForm from "@/components/clients/ClientForm";
import type { ClientRequest, ClientResponse } from "@/types/client-api";
import Modal from "../ui/common/Modal";

interface ClientModalProps {
    open: boolean;
    clienteEditando: ClientResponse | null;
    onClose: () => void;
    onSave: (cliente: ClientRequest) => Promise<void>;
}

//Container modal component
export default function ClientModal({
    open,
    clienteEditando,
    onClose,
    onSave,
}: ClientModalProps) {
    const isEditing = Boolean(clienteEditando);

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="2xl"
            title={isEditing ? "Editar Cliente" : "Registrar Nuevo Cliente"}
            subtitle={
                isEditing
                    ? "Actualiza la información del perfil del cliente."
                    : "Crea un nuevo registro de cliente en el sistema."
            }
        >
            {/* Modal retorna null cuando open=false → ClientForm se monta limpio en cada apertura */}
            <ClientForm
                clienteEditando={clienteEditando}
                onSubmit={onSave}
                onCancel={onClose}
            />
        </Modal>
    );
}