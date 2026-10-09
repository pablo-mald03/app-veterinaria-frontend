"use client";

import Modal from "@/components/ui/common/Modal";
import VaccineForm from "@/components/vaccines/VaccineForm";
import type { VaccineCatalogInput } from "@/types/vaccines/vaccineCatalog";

interface VaccineModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (input: VaccineCatalogInput) => Promise<void>;
}

//Modal para crear una vacuna en el catálogo
export default function VaccineModal({ open, onClose, onSave }: VaccineModalProps) {
    return (
        <Modal open={open} onClose={onClose} size="lg" title="Nueva vacuna" subtitle="Catálogo de vacunas">
            <VaccineForm onSubmit={onSave} onCancel={onClose} />
        </Modal>
    );
}
