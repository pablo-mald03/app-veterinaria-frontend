"use client";

import Modal from "@/components/ui/common/Modal";
import ConsultationForm from "@/components/consultation/ConsultationForm";
import type { Mascota } from "@/types/pet";
import type { ConsultationInput } from "@/types/consultation";

interface ConsultationModalProps {
    open: boolean;
    mascota: Mascota;
    onClose: () => void;
    onSave: (input: ConsultationInput) => Promise<void>;
}

//Modal para registrar una consulta
export default function ConsultationModal({ open, mascota, onClose, onSave }: ConsultationModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            title="Registrar consulta"
            subtitle={`${mascota.name} · ${mascota.especie}`}
        >
            <ConsultationForm onSubmit={onSave} onCancel={onClose} />
        </Modal>
    );
}
