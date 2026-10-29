"use client";

import Modal from "@/components/ui/common/Modal";
import VaccineForm from "@/components/vaccines/VaccineForm";
import type { TreatmentCatalogInput } from "@/types/vaccines/vaccineCatalog";

interface VaccineModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (input: TreatmentCatalogInput) => Promise<void>;
}

//Modal para crear un tratamiento en el catálogo
export default function VaccineModal({ open, onClose, onSave }: VaccineModalProps) {
    return (
        <Modal open={open} onClose={onClose} size="lg" title="Nuevo tratamiento" subtitle="Catálogo de tratamientos">
            <VaccineForm onSubmit={onSave} onCancel={onClose} />
        </Modal>
    );
}
