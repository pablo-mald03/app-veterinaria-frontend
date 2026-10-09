"use client";

import Modal from "@/components/ui/common/Modal";
import VaccinationForm from "@/components/vaccination/VaccinationForm";
import { useVaccineCatalog } from "@/hooks/useVaccineCatalog";
import type { Mascota } from "@/types/pet";
import type { VaccinationInput, VaccinationView } from "@/types/vaccination";

interface VaccinationModalProps {
    open: boolean;
    mascota: Mascota;
    records: VaccinationView[];
    onClose: () => void;
    onSave: (input: VaccinationInput) => Promise<void>;
}

//Modal para registrar una vacuna (carga el catálogo solo cuando se abre)
export default function VaccinationModal({ open, mascota, records, onClose, onSave }: VaccinationModalProps) {
    const catalog = useVaccineCatalog(open);

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            title="Registrar vacuna"
            subtitle={`${mascota.name} · ${mascota.especie}`}
        >
            <VaccinationForm
                mascota={mascota}
                records={records}
                catalog={catalog.catalog}
                loadingCatalog={catalog.loading}
                catalogError={catalog.error}
                onRetryCatalog={catalog.reload}
                onSubmit={onSave}
                onCancel={onClose}
            />
        </Modal>
    );
}
